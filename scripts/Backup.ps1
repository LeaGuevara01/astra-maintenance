[CmdletBinding()]
param([ValidateSet('dev','staging','prod')][string]$Environment='staging')
. "$PSScriptRoot/Common.ps1"
$context=Get-AstraContext $Environment
$lock=Enter-AstraLock $context
try {New-AstraBackup $context} finally {$lock.Dispose()}
