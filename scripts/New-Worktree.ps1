[CmdletBinding()]
param([Parameter(Mandatory)][ValidatePattern('^(feat|fix|chore)/[a-zA-Z0-9][a-zA-Z0-9/-]+$')][string]$Branch,[Parameter(Mandatory)][string]$Destination,[string]$Base='HEAD')
. "$PSScriptRoot/Common.ps1"
$target=[IO.Path]::GetFullPath($Destination)
if(Test-Path -LiteralPath $target){throw 'Choose a new worktree directory'}
Invoke-Checked git @('-C',$script:AstraRoot,'worktree','add','-b',$Branch,$target,$Base)
Write-Output "Run scripts/Prepare.ps1 in $target to allocate isolated ports, project and credentials."
