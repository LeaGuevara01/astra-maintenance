Set-StrictMode -Version Latest
$ErrorActionPreference='Stop'
$script:AstraRoot=Split-Path $PSScriptRoot -Parent
function Invoke-Checked {
 param([Parameter(Mandatory)][string]$Command,[string[]]$Arguments=@())
 & $Command @Arguments
 if($LASTEXITCODE -ne 0){throw "$Command failed with exit code $LASTEXITCODE"}
}
function New-AstraSecret {
 $bytes=New-Object byte[] 24
 [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
 [Convert]::ToBase64String($bytes).TrimEnd('=').Replace('+','-').Replace('/','_')
}
function Get-AstraAvailablePort {
 param([int]$Preferred,[switch]$Fixed)
 for($candidate=$Preferred;$candidate -lt [Math]::Min(65535,$Preferred+100);$candidate++){
  $listener=New-Object Net.Sockets.TcpListener([Net.IPAddress]::Loopback,$candidate)
  try {$listener.Start();return $candidate}
  catch {if($Fixed){throw "Port $Preferred is occupied; select an explicit free port before preparing this environment."}}
  finally {$listener.Stop()}
 }
 throw 'No free port available in the requested range'
}
function Get-AstraContext {
 param([ValidateSet('dev','test','staging','prod')][string]$Environment='dev',[switch]$Create)
 $dir=Join-Path $script:AstraRoot ".runtime/$Environment"
 $path=Join-Path $dir 'config.json'
 if(!(Test-Path -LiteralPath $path)){
  if(!$Create){throw "Environment $Environment is not prepared"}
  New-Item -ItemType Directory -Path $dir -Force | Out-Null
  $hash=[Security.Cryptography.SHA256]::Create().ComputeHash([Text.Encoding]::UTF8.GetBytes($script:AstraRoot.ToLowerInvariant()))
  $key=([BitConverter]::ToString($hash)).Replace('-','').Substring(0,8).ToLowerInvariant()
  $base=45000+([BitConverter]::ToUInt16($hash,0)%1000)*4
  $offset=@{dev=0;test=1;staging=2;prod=3}[$Environment]
  $webPort=if($Environment -eq 'staging'){4380}elseif($Environment -eq 'prod'){4382}else{$base+$offset}
  $webPort=Get-AstraAvailablePort $webPort -Fixed:($Environment -in @('staging','prod'))
  $dbPort=Get-AstraAvailablePort ($base+$offset+5000)
  $apiPort=Get-AstraAvailablePort ($base+$offset+10000)
  $cfg=[ordered]@{schemaVersion=1;environment=$Environment;project="astra-$Environment-$key";dbPort=($base+$offset+5000);webPort=$webPort;apiPort=($base+$offset+10000);dbName=$(if($Environment -eq 'test'){'astra_test'}else{'astra'});dbPassword=(New-AstraSecret);adminPassword=(New-AstraSecret);techPassword=(New-AstraSecret);viewerPassword=(New-AstraSecret);origin="http://localhost:$webPort";bindAddress='127.0.0.1';webContainerPort=8080;cookieSecure='false';apiImage='astra-api:unbuilt';webImage='astra-web:unbuilt';commit='unknown'}
  $cfg.dbPort=$dbPort;$cfg.apiPort=$apiPort
  $cfg | ConvertTo-Json | Set-Content -LiteralPath $path -Encoding utf8
 }
 $cfg=Get-Content -LiteralPath $path -Raw | ConvertFrom-Json
 $cfg | Add-Member -NotePropertyName directory -NotePropertyValue $dir -Force
 $cfg | Add-Member -NotePropertyName configPath -NotePropertyValue $path -Force
 $cfg | Add-Member -NotePropertyName envPath -NotePropertyValue (Join-Path $dir '.env') -Force
 return $cfg
}
function Save-AstraContext {
 param($Context)
 $Context | Select-Object * -ExcludeProperty directory,configPath,envPath | ConvertTo-Json | Set-Content -LiteralPath $Context.configPath -Encoding utf8
 $images=Get-Content (Join-Path $script:AstraRoot 'images.lock.json') -Raw | ConvertFrom-Json
 $caddyPath=(Join-Path $Context.directory 'Caddyfile').Replace('\','/')
 $vars=[ordered]@{POSTGRES_IMAGE=$images.postgres;DB_PASSWORD=$Context.dbPassword;DB_PORT=$Context.dbPort;DB_NAME=$Context.dbName;APP_ORIGIN=$Context.origin;ASTRA_ENV=$Context.environment;API_IMAGE=$Context.apiImage;WEB_IMAGE=$Context.webImage;GIT_COMMIT=$Context.commit;COOKIE_SECURE=$Context.cookieSecure;SEED_ADMIN_PASSWORD=$Context.adminPassword;SEED_TECH_PASSWORD=$Context.techPassword;SEED_VIEWER_PASSWORD=$Context.viewerPassword;BIND_ADDRESS=$Context.bindAddress;WEB_PORT=$Context.webPort;WEB_CONTAINER_PORT=$Context.webContainerPort;CADDYFILE=$caddyPath}
 $lines=$vars.GetEnumerator() | ForEach-Object { "$($_.Key)=$($_.Value)" }
 $lines | Set-Content -LiteralPath $Context.envPath -Encoding utf8
 $site=if($Context.cookieSecure -eq 'true'){ "$(([uri]$Context.origin).Host):$($Context.webContainerPort)"}else{"http://:$($Context.webContainerPort)"}
 $tls=if($Context.cookieSecure -eq 'true'){'tls internal'}else{''}
 @"
{
 admin off
 auto_https disable_redirects
}
$site {
 $tls
 encode gzip
 handle /api/* {
  reverse_proxy api:4301
 }
 handle /health/* {
  reverse_proxy api:4301
 }
 handle {
  root * /srv
  try_files {path} /index.html
  file_server
 }
}
"@ | Set-Content -LiteralPath (Join-Path $Context.directory 'Caddyfile') -Encoding utf8
}
function Invoke-AstraCompose {
 param($Context,[string[]]$Arguments)
 # Compose process environment overrides --env-file; never inherit another ASTRA environment.
 $saved=@{}
 try {
  foreach($line in (Get-Content -LiteralPath $Context.envPath)){
   if($line -match '^([A-Z_][A-Z0-9_]*)='){
    $name=$Matches[1];$saved[$name]=[Environment]::GetEnvironmentVariable($name,'Process')
    [Environment]::SetEnvironmentVariable($name,$null,'Process')
   }
  }
  $composePath=if($Context.PSObject.Properties.Name -contains 'composePath'){$Context.composePath}else{Join-Path $script:AstraRoot 'compose.yaml'}
  Invoke-Checked docker (@('compose','--env-file',$Context.envPath,'-p',$Context.project,'-f',$composePath)+$Arguments)
 } finally {foreach($name in $saved.Keys){[Environment]::SetEnvironmentVariable($name,$saved[$name],'Process')}}
}
function Set-AstraLocalEnvironment {
 param($Context)
 $env:DATABASE_URL="postgresql://astra:$($Context.dbPassword)@127.0.0.1:$($Context.dbPort)/$($Context.dbName)"
 $env:TEST_DATABASE_URL=$env:DATABASE_URL
 $env:APP_ORIGIN="http://localhost:$($Context.webPort)"
 $env:APP_ENVIRONMENT=if($Context.environment -eq 'dev'){'development'}else{$Context.environment}
 $env:COOKIE_SECURE='false'
 $env:PORT=[string]$Context.apiPort
 $env:WEB_PORT=[string]$Context.webPort
 $env:API_TARGET="http://localhost:$($Context.apiPort)"
 $env:SEED_ADMIN_PASSWORD=$Context.adminPassword
 $env:SEED_TECH_PASSWORD=$Context.techPassword
 $env:SEED_VIEWER_PASSWORD=$Context.viewerPassword
}
function Get-CleanAstraCommit {
 $dirty=& git -C $script:AstraRoot status --porcelain
 if($LASTEXITCODE -ne 0){throw 'Git unavailable'}
 if($dirty){throw 'Commit intended source changes before deploying; working tree is dirty.'}
 $sha=& git -C $script:AstraRoot rev-parse HEAD
 if($LASTEXITCODE -ne 0){throw 'Git HEAD unavailable'}
 return $sha.Trim()
}
function Enter-AstraLock {
 param($Context)
 try {return [IO.File]::Open((Join-Path $Context.directory 'deploy.lock'),[IO.FileMode]::OpenOrCreate,[IO.FileAccess]::ReadWrite,[IO.FileShare]::None)}
 catch {throw "Another deployment or recovery is running for $($Context.environment)."}
}
function Test-AstraHttp {
 param($Context,[string]$ExpectedCommit)
 $url="$($Context.origin)/health/ready"
 $last=$null
 for($i=0;$i -lt 30;$i++){
  try{
   $check=Invoke-RestMethod -Uri $url -TimeoutSec 5
   $version=Invoke-RestMethod -Uri "$($Context.origin)/api/v1/version" -TimeoutSec 5
   if($version.commit -ne $ExpectedCommit){throw "Version mismatch: expected $ExpectedCommit"}
   return $version
  }catch{$last=$_;Start-Sleep -Seconds 1}
 }
 throw "Health/version failed: $last"
}

function Write-AstraJson {
 param([string]$Path,$Value)
 $temporary=$Path+'.'+[Guid]::NewGuid().ToString('N')+'.tmp'
 $Value | ConvertTo-Json -Depth 20 | Set-Content -LiteralPath $temporary -Encoding utf8
 if(Test-Path -LiteralPath $Path){[IO.File]::Replace($temporary,$Path,$null)}else{[IO.File]::Move($temporary,$Path)}
}
function Get-AstraImageId {
 param([string]$Image)
 $value=& docker image inspect $Image --format '{{.Id}}'
 if($LASTEXITCODE -ne 0 -or !$value){throw 'Required image is unavailable'}
 return $value.Trim()
}
function Test-AstraReleaseImages {
 param($Release)
 foreach($kind in @('api','web')){
  $expected=$Release.("${kind}Digest")
  if($expected -notmatch '^sha256:[a-f0-9]{64}$' -or (Get-AstraImageId $expected) -ne $expected){throw 'Recorded release image unavailable'}
 }
}
function Set-AstraRelease {
 param($Context,$Release)
 Test-AstraReleaseImages $Release
 $Context.apiImage=$Release.apiDigest;$Context.webImage=$Release.webDigest;$Context.commit=$Release.commit
 Save-AstraContext $Context
 Invoke-AstraCompose $Context @('up','-d','--wait','api','web')
 Test-AstraHttp $Context $Release.commit | Out-Null
}
function Get-AstraDatabaseFingerprint {
 param($Context)
 $sql=Get-Content (Join-Path $script:AstraRoot 'scripts/Database-Fingerprint.sql') -Raw
 $json=Invoke-AstraCompose $Context @('exec','-T','db','psql','-U','astra','-d',$Context.dbName,'-X','-qAt','-v','ON_ERROR_STOP=1','-c',$sql)
 return ($json -join '') | ConvertFrom-Json
}
function New-AstraBackup {
 param($Context)
 # Caller holds the environment lock. This helper must not reacquire it.
 $backupDir=Join-Path $script:AstraRoot ".runtime/backups/$($Context.environment)"
 New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
 $name=(Get-Date).ToUniversalTime().ToString('yyyyMMdd-HHmmss-fff')+'.dump'
 $dest=Join-Path $backupDir $name
 $before=Get-AstraDatabaseFingerprint $Context
 try {
  Invoke-AstraCompose $Context @('exec','-T','db','pg_dump','-U','astra','-d',$Context.dbName,'-Fc','-f',"/tmp/$name") | Out-Null
  Invoke-AstraCompose $Context @('cp',"db:/tmp/$name",$dest) | Out-Null
 } finally {Invoke-AstraCompose $Context @('exec','-T','db','rm','-f',"/tmp/$name") | Out-Null}
 if((Get-Item -LiteralPath $dest).Length -lt 100){throw 'Backup is unexpectedly small'}
 $after=Get-AstraDatabaseFingerprint $Context
 $stable=($before | ConvertTo-Json -Depth 10 -Compress) -eq ($after | ConvertTo-Json -Depth 10 -Compress)
 $sha=(Get-FileHash -LiteralPath $dest -Algorithm SHA256).Hash
 $metadata=@{file=$name;sha256=$sha;sourceProject=$Context.project;environment=$Context.environment;database=$Context.dbName;createdAt=(Get-Date).ToUniversalTime().ToString('o');stableFingerprint=$stable;fingerprint=$(if($stable){$before}else{$null})}
 Write-AstraJson "$dest.json" $metadata
 $old=Get-ChildItem -LiteralPath $backupDir -Filter '*.dump' | Where-Object {$_.Name -match '^\d{8}-\d{6}-\d{3}\.dump$'} | Sort-Object Name -Descending | Select-Object -Skip 7
 foreach($item in $old){
  if($item.LastWriteTime -lt (Get-Date).AddDays(-7)){
   Remove-Item -LiteralPath $item.FullName
   if(Test-Path -LiteralPath "$($item.FullName).json"){Remove-Item -LiteralPath "$($item.FullName).json"}
  }
 }
 return $dest
}
