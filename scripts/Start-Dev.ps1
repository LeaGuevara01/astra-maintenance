[CmdletBinding()]
param()
. "$PSScriptRoot/Common.ps1"
$context=Get-AstraContext dev
$lock=$null
$ports=Resolve-AstraMutablePorts $context
Save-AstraContext $context
if($ports){Write-Warning "Reassigned occupied ports for dev: $($ports -join ', ')"}
Set-AstraLocalEnvironment $context
$env:NODE_ENV='development'
Push-Location $script:AstraRoot
try {
 $lock=Enter-AstraLock $context
 Invoke-AstraCompose $context @('up','-d','--wait','db')
 Invoke-Checked npm.cmd @('run','dev')
} finally {
 if($lock){$lock.Dispose()}
 Pop-Location
}
