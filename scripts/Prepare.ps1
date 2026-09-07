[CmdletBinding()]
param([ValidateSet('dev','test')][string]$Environment='dev')
. "$PSScriptRoot/Common.ps1"
Push-Location $script:AstraRoot
try {
 $context=Get-AstraContext $Environment -Create
 Save-AstraContext $context
 Invoke-Checked docker @('info','--format','{{.ServerVersion}}')
 Invoke-Checked npm.cmd @('ci')
 Set-AstraLocalEnvironment $context
 Invoke-Checked npm.cmd @('run','db:generate')
 Invoke-AstraCompose $context @('up','-d','--wait','db')
 Invoke-Checked npm.cmd @('run','db:migrate')
 Invoke-Checked npm.cmd @('run','db:seed')
 Write-Output "Prepared $($context.project); credentials: $($context.configPath)"
} finally {Pop-Location}
