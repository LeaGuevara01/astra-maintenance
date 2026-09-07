[CmdletBinding()]
param([Parameter(Mandatory)][string]$Backup)
. "$PSScriptRoot/Common.ps1"
$context=Get-AstraContext staging
$source=(Resolve-Path -LiteralPath $Backup).Path
$meta=Get-Content "$source.json" -Raw | ConvertFrom-Json
if((Get-FileHash $source -Algorithm SHA256).Hash -ne $meta.sha256){throw 'Backup checksum mismatch'}
$dbName='restore_'+(Get-Date).ToUniversalTime().ToString('yyyyMMddHHmmssfff')
Invoke-AstraCompose $context @('cp',$source,'db:/tmp/astra-restore.dump')
Invoke-AstraCompose $context @('exec','-T','db','createdb','-U','astra',$dbName)
Invoke-AstraCompose $context @('exec','-T','db','pg_restore','--exit-on-error','--no-owner','-U','astra','-d',$dbName,'/tmp/astra-restore.dump')
Invoke-AstraCompose $context @('exec','-T','db','psql','-U','astra','-d',$dbName,'-c','SELECT count(*) AS restored_tables FROM information_schema.tables WHERE table_schema = ''public'';')
@{checkedAt=(Get-Date).ToUniversalTime().ToString('o');sourceBackup=$meta.file;sha256=$meta.sha256;restoredDatabase=$dbName;sourceProject=$context.project} | ConvertTo-Json | Set-Content (Join-Path $context.directory 'restore-evidence.json') -Encoding utf8
Write-Output "Restored into separate database $dbName; live database unchanged."
