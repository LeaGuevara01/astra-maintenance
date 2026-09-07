[CmdletBinding()]
param([switch]$SkipInstall)
. "$PSScriptRoot/Common.ps1"
Push-Location $script:AstraRoot
try {
 $context=Get-AstraContext test -Create
 Save-AstraContext $context
 Set-AstraLocalEnvironment $context
 $env:NODE_ENV='test'
 if(!$SkipInstall){Invoke-Checked npm.cmd @('ci')}
 Invoke-Checked npm.cmd @('run','db:generate')
 Invoke-AstraCompose $context @('up','-d','--wait','db')
 Invoke-Checked npm.cmd @('run','db:migrate')
 Invoke-Checked npm.cmd @('run','typecheck')
 Invoke-Checked npm.cmd @('test')
 $env:NODE_ENV='production'
 Invoke-Checked npm.cmd @('run','build')
 $record=@{checkedAt=(Get-Date).ToUniversalTime().ToString('o');commit=(& git rev-parse HEAD).Trim();dirty=[bool](& git status --porcelain);checks=@('typecheck','tests','build');environment=$context.project}
 $record | ConvertTo-Json | Set-Content (Join-Path $context.directory 'verification.json') -Encoding utf8
} finally {Pop-Location}
