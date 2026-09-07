[CmdletBinding()]
param()
. "$PSScriptRoot/Common.ps1"
$context=Get-AstraContext dev
Set-AstraLocalEnvironment $context
$env:NODE_ENV='development'
Push-Location $script:AstraRoot
try {Invoke-AstraCompose $context @('up','-d','--wait','db'); Invoke-Checked npm.cmd @('run','dev')} finally {Pop-Location}
