[CmdletBinding()]
param(
 [Parameter(Mandatory)]
 [ValidatePattern('^(?:(?:feat|fix|chore)/[a-zA-Z0-9][a-zA-Z0-9/-]+|agent/(?:backend|frontend|database|research)/ASTRA-[a-zA-Z0-9][a-zA-Z0-9-]*)$')]
 [string]$Branch,
 [Parameter(Mandatory)][string]$Destination,
 [string]$Base='HEAD',
 [ValidatePattern('^ASTRA-[A-Z0-9]+(?:-[A-Z0-9]+)*$')][string]$TaskId,
 [ValidateSet('integrator','backend','frontend','database','research')][string]$Role='integrator'
)
. "$PSScriptRoot/Common.ps1"
$target=[IO.Path]::GetFullPath($Destination)
if(Test-Path -LiteralPath $target){throw 'Choose a new worktree directory'}
$baseSha=(& git -C $script:AstraRoot rev-parse --verify "$Base^{commit}")
if($LASTEXITCODE -ne 0 -or !$baseSha){throw "Base $Base does not resolve to a commit"}
$baseSha=$baseSha.Trim()
if($Branch -match '^agent/(?<branchRole>backend|frontend|database|research)/'){
 $branchRole=$Matches.branchRole
 if($branchRole -ne $Role){throw "Agent branch role $branchRole does not match assigned role $Role"}
}
if($TaskId -and $Branch -match '^agent/[^/]+/(?<branchTask>ASTRA-[a-zA-Z0-9-]+)$'){
 $branchTask=$Matches.branchTask
 if($branchTask -notmatch "^$([regex]::Escape($TaskId))(?:-|$)"){throw "Agent branch task $branchTask does not match TaskId $TaskId"}
}
Invoke-Checked git @('-C',$script:AstraRoot,'worktree','add','-b',$Branch,$target,$baseSha)
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
Write-Output "Assignment: task $(if($TaskId){$TaskId}else{'UNRECORDED'}) | role $Role | base $baseSha."
if(!$TaskId){Write-Warning 'No TaskId was supplied. Record the task, ownership and dependencies before implementation.'}
Write-Output "Dev context ready: $($contexts.devProject) | web $($contexts.devWebPort) | api $($contexts.devApiPort) | db $($contexts.devDbPort) | $($contexts.devConfig)"
Write-Output "Test context ready: $($contexts.testProject) | db $($contexts.testDbPort) | $($contexts.testConfig)"
Write-Output "Run scripts/Prepare.ps1 in $target to install dependencies and migrate the isolated database."
