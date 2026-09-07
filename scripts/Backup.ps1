[CmdletBinding()]
param([ValidateSet('dev','staging','prod')][string]$Environment='staging')
. "$PSScriptRoot/Common.ps1"
$context=Get-AstraContext $Environment
$backupDir=Join-Path $script:AstraRoot ".runtime/backups/$Environment"
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
$name=(Get-Date).ToUniversalTime().ToString('yyyyMMdd-HHmmss-fff')+'.dump'
$dest=Join-Path $backupDir $name
# pg_dump writes inside container; docker cp transfers binary without PowerShell redirection.
Invoke-AstraCompose $context @('exec','-T','db','pg_dump','-U','astra','-d','astra','-Fc','-f',"/tmp/$name")
Invoke-AstraCompose $context @('cp',"db:/tmp/$name",$dest)
if((Get-Item $dest).Length -lt 100){throw 'Backup is unexpectedly small'}
$sha=(Get-FileHash $dest -Algorithm SHA256).Hash
@{file=$name;sha256=$sha;sourceProject=$context.project;environment=$Environment;createdAt=(Get-Date).ToUniversalTime().ToString('o')} | ConvertTo-Json | Set-Content "$dest.json" -Encoding utf8
# Delete only dated backups created by this script, older than retention; preserve newest seven files.
$old=Get-ChildItem -LiteralPath $backupDir -Filter '*.dump' | Where-Object {$_.Name -match '^\d{8}-\d{6}-\d{3}\.dump$'} | Sort-Object Name -Descending | Select-Object -Skip 7
foreach($item in $old){
 if($item.LastWriteTime -lt (Get-Date).AddDays(-7)){
  Remove-Item -LiteralPath $item.FullName
  if(Test-Path -LiteralPath "$($item.FullName).json"){Remove-Item -LiteralPath "$($item.FullName).json"}
 }
}
Write-Output $dest
