[CmdletBinding()]
param()
. "$PSScriptRoot/Common.ps1"
$context=Get-AstraContext staging
$lock=Enter-AstraLock $context
$current=$null;$activated=$false
try {
 $previous=Get-Content (Join-Path $context.directory 'previous-release.json') -Raw | ConvertFrom-Json
 $current=Get-Content (Join-Path $context.directory 'release.json') -Raw | ConvertFrom-Json
 Test-AstraReleaseImages $previous
 Test-AstraReleaseImages $current
 $activated=$true
 Set-AstraRelease $context $previous
 Write-AstraJson (Join-Path $context.directory 'release.json') $previous
 Write-AstraJson (Join-Path $context.directory 'previous-release.json') $current
 Write-Output "Application reverted to $($previous.commit). Database preserved."
} catch {
 $failure=$_
 if($activated -and $current){
  try {Set-AstraRelease $context $current}catch {Write-Warning 'Rollback recovery requires intervention; database is preserved.'}
 }
 throw $failure
} finally {$lock.Dispose()}
