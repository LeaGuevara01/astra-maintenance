[CmdletBinding()]
param([Parameter(Mandatory)][ValidatePattern('^(feat|fix|chore)/[a-zA-Z0-9][a-zA-Z0-9/-]+$')][string]$Branch,[Parameter(Mandatory)][string]$Destination,[string]$Base='HEAD')
. "$PSScriptRoot/Common.ps1"
$target=[IO.Path]::GetFullPath($Destination)
if(Test-Path -LiteralPath $target){throw 'Choose a new worktree directory'}
Invoke-Checked git @('-C',$script:AstraRoot,'worktree','add','-b',$Branch,$target,$Base)
$bootstrap=Join-Path $target 'scripts/Common.ps1'
if(!(Test-Path -LiteralPath $bootstrap)){throw 'The new worktree does not contain scripts/Common.ps1'}
$contexts=& {
 . $bootstrap
 $dev=Get-AstraContext dev -Create
 Save-AstraContext $dev
 $test=Get-AstraContext test -Create
 Save-AstraContext $test
 [pscustomobject]@{
  devProject=$dev.project
  devConfig=$dev.configPath
  devWebPort=$dev.webPort
  devApiPort=$dev.apiPort
  devDbPort=$dev.dbPort
  testProject=$test.project
  testConfig=$test.configPath
  testDbPort=$test.dbPort
 }
}
Write-Output "Created worktree $target on $Branch."
Write-Output "Dev context ready: $($contexts.devProject) | web $($contexts.devWebPort) | api $($contexts.devApiPort) | db $($contexts.devDbPort) | $($contexts.devConfig)"
Write-Output "Test context ready: $($contexts.testProject) | db $($contexts.testDbPort) | $($contexts.testConfig)"
Write-Output "Run scripts/Prepare.ps1 in $target to install dependencies and migrate the isolated database."
