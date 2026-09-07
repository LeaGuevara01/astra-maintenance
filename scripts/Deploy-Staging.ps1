[CmdletBinding()]
param([switch]$Seed,[switch]$SkipVerify)
. "$PSScriptRoot/Common.ps1"
$context=Get-AstraContext staging -Create
$lock=Enter-AstraLock $context
Push-Location $script:AstraRoot
try {
 $sha=Get-CleanAstraCommit
 if(!$SkipVerify){& "$PSScriptRoot/Verify.ps1" -SkipInstall}
 $verificationPath=Join-Path $script:AstraRoot '.runtime/test/verification.json'
 if(!(Test-Path $verificationPath)){throw 'Verification required for this commit'}
 $verification=Get-Content $verificationPath -Raw | ConvertFrom-Json
 if($verification.commit -ne $sha -or $verification.dirty){throw 'Verification must match clean deployment commit'}
 $images=Get-Content images.lock.json -Raw | ConvertFrom-Json
 $previous=if(Test-Path (Join-Path $context.directory 'release.json')){Get-Content (Join-Path $context.directory 'release.json') -Raw | ConvertFrom-Json}else{$null}
 Invoke-Checked docker @('build','--build-arg',"NODE_IMAGE=$($images.node)",'--build-arg',"CADDY_IMAGE=$($images.caddy)",'--build-arg',"GIT_COMMIT=$sha",'--target','api','-t',"astra-api:$sha",'.')
 Invoke-Checked docker @('build','--build-arg',"NODE_IMAGE=$($images.node)",'--build-arg',"CADDY_IMAGE=$($images.caddy)",'--target','web','-t',"astra-web:$sha",'.')
 $context.apiImage="astra-api:$sha";$context.webImage="astra-web:$sha";$context.commit=$sha
 Save-AstraContext $context
 Invoke-AstraCompose $context @('up','-d','--wait','db')
 if($previous){& "$PSScriptRoot/Backup.ps1" -Environment staging}
 Invoke-AstraCompose $context @('run','--rm','--no-deps','api','npm','run','db:migrate')
 if($Seed){Invoke-AstraCompose $context @('run','--rm','--no-deps','api','npm','run','db:seed')}
 Invoke-AstraCompose $context @('up','-d','--wait','api','web')
 try {$version=Test-AstraHttp $context $sha}
 catch {
  if($previous){
   $context.apiImage=$previous.apiImage;$context.webImage=$previous.webImage;$context.commit=$previous.commit
   Save-AstraContext $context
   Invoke-AstraCompose $context @('up','-d','--wait','api','web')
  }
  throw
 }
 $apiDigest=(& docker image inspect $context.apiImage --format '{{.Id}}').Trim()
 $webDigest=(& docker image inspect $context.webImage --format '{{.Id}}').Trim()
 if($previous){$previous | ConvertTo-Json -Depth 8 | Set-Content (Join-Path $context.directory 'previous-release.json') -Encoding utf8}
 $release=@{version='0.1.0';commit=$sha;apiImage=$context.apiImage;webImage=$context.webImage;apiDigest=$apiDigest;webDigest=$webDigest;origin=$context.origin;deployedAt=(Get-Date).ToUniversalTime().ToString('o');environment='staging';verification=$verification}
 $release | ConvertTo-Json -Depth 8 | Set-Content (Join-Path $context.directory 'release.json') -Encoding utf8
 Write-Output "Staging ready: $($context.origin) | $sha"
} finally {Pop-Location;$lock.Dispose()}
