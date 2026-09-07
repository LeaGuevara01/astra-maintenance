[CmdletBinding()]
param([Parameter(Mandatory)][string]$Backup,[ValidateSet('staging','dev')][string]$Environment='staging')
. "$PSScriptRoot/Common.ps1"
$context=Get-AstraContext $Environment
$lock=Enter-AstraLock $context
$restore=$null
try {
 $source=(Resolve-Path -LiteralPath $Backup).Path
 $meta=Get-Content -LiteralPath "$source.json" -Raw | ConvertFrom-Json
 if((Get-FileHash -LiteralPath $source -Algorithm SHA256).Hash -ne $meta.sha256){throw 'Backup checksum mismatch'}
 if($meta.sourceProject -ne $context.project){throw 'Backup belongs to a different environment'}
 if(!$meta.stableFingerprint -or !$meta.fingerprint){throw 'A stable source fingerprint is required for this verification; create a backup while synthetic staging is idle.'}
 if($meta.database -notmatch '^[a-z_][a-z0-9_]*$'){throw 'Invalid backup database name'}
 $before=Get-AstraDatabaseFingerprint $context
 $id=[Guid]::NewGuid().ToString('N').Substring(0,12)
 $dir=Join-Path $script:AstraRoot ".runtime/restore/$id"
 New-Item -ItemType Directory -Path $dir | Out-Null
 $restore=[pscustomobject]@{project="astra-restore-$id";envPath=(Join-Path $dir '.env');composePath=(Join-Path $dir 'compose.yaml');dbName=$meta.database}
 $images=Get-Content (Join-Path $script:AstraRoot 'images.lock.json') -Raw | ConvertFrom-Json
 @("POSTGRES_IMAGE=$($images.postgres)","DB_NAME=$($meta.database)","DB_PASSWORD=$(New-AstraSecret)") | Set-Content -LiteralPath $restore.envPath -Encoding utf8
 @'
services:
  db:
    image: ${POSTGRES_IMAGE}
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: astra
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - database:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U astra -d ${DB_NAME}"]
      interval: 2s
      timeout: 3s
      retries: 30
    networks: [isolated]
networks:
  isolated:
    internal: true
volumes:
  database:
'@ | Set-Content -LiteralPath $restore.composePath -Encoding utf8
 Invoke-AstraCompose $restore @('up','-d','--wait','db') | Out-Null
 $sourceId=(Invoke-AstraCompose $context @('ps','-q','db') | Out-String).Trim()
 $restoreId=(Invoke-AstraCompose $restore @('ps','-q','db') | Out-String).Trim()
 if(!$sourceId -or !$restoreId -or $sourceId -eq $restoreId){throw 'Container isolation failed'}
 $sourceMounts=(& docker inspect $sourceId --format '{{json .Mounts}}') | ConvertFrom-Json
 $restoreMounts=(& docker inspect $restoreId --format '{{json .Mounts}}') | ConvertFrom-Json
 $sourceVolume=($sourceMounts | Where-Object Destination -eq '/var/lib/postgresql/data').Name
 $restoreVolume=($restoreMounts | Where-Object Destination -eq '/var/lib/postgresql/data').Name
 if(!$sourceVolume -or !$restoreVolume -or $sourceVolume -eq $restoreVolume){throw 'Volume isolation failed'}
 Invoke-AstraCompose $restore @('cp',$source,'db:/tmp/restore.dump') | Out-Null
 Invoke-AstraCompose $restore @('exec','-T','db','pg_restore','--exit-on-error','--no-owner','-U','astra','-d',$restore.dbName,'/tmp/restore.dump') | Out-Null
 $restored=Get-AstraDatabaseFingerprint $restore
 if(($restored | ConvertTo-Json -Depth 10 -Compress) -ne ($meta.fingerprint | ConvertTo-Json -Depth 10 -Compress)){throw 'Restored rows differ from the backup fingerprint'}
 $after=Get-AstraDatabaseFingerprint $context
 if(($before | ConvertTo-Json -Depth 10 -Compress) -ne ($after | ConvertTo-Json -Depth 10 -Compress)){throw 'Source changed during verification; repeat while synthetic staging is idle'}
 $evidence=@{checkedAt=(Get-Date).ToUniversalTime().ToString('o');backupSha256=$meta.sha256;sourceProject=$context.project;restoreProject=$restore.project;sourceVolume=$sourceVolume;restoreVolume=$restoreVolume;sourceUnchanged=$true;rowsMatch=$true;fingerprint=$restored;status='PASSED'}
 Write-AstraJson (Join-Path $dir 'evidence.json') $evidence
 Write-AstraJson (Join-Path $context.directory 'restore-evidence.json') $evidence
 Write-Output "Restore verified in independent project $($restore.project), volume $restoreVolume. Evidence: $dir/evidence.json"
} finally {
 if($restore){try {Invoke-AstraCompose $restore @('stop','db') | Out-Null}catch {Write-Warning 'Restore container could not be stopped; its isolated volume is preserved.'}}
 $lock.Dispose()
}
