[CmdletBinding()]
param([ValidateSet('dev','test')][string]$Environment='dev')
. "$PSScriptRoot/Common.ps1"
$lock=$null
Push-Location $script:AstraRoot
try {
 $context=Get-AstraContext $Environment -Create
 $lock=Enter-AstraLock $context
 $ports=Resolve-AstraMutablePorts $context
 Save-AstraContext $context
 if($ports){Write-Warning "Reassigned occupied ports for ${Environment}: $($ports -join ', ')"}
 Invoke-Checked docker @('info','--format','{{.ServerVersion}}')
 Invoke-Checked npm.cmd @('ci')
 Set-AstraLocalEnvironment $context
 Invoke-Checked npm.cmd @('run','db:generate')
 Invoke-AstraCompose $context @('up','-d','--wait','db')
 Invoke-Checked npm.cmd @('run','db:migrate')
 Invoke-Checked npm.cmd @('run','db:seed')
 Write-Output "Prepared $($context.project); credentials: $($context.configPath)"
} finally {
 if($lock){$lock.Dispose()}
 Pop-Location
}
