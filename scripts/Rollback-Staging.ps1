[CmdletBinding()]
param()
. "$PSScriptRoot/Common.ps1"
$context=Get-AstraContext staging
$lock=Enter-AstraLock $context
try {
 $previous=Get-Content (Join-Path $context.directory 'previous-release.json') -Raw | ConvertFrom-Json
 $current=Get-Content (Join-Path $context.directory 'release.json') -Raw | ConvertFrom-Json
 foreach($pair in @(@($previous.apiImage,$previous.apiDigest),@($previous.webImage,$previous.webDigest))){
  $actual=(& docker image inspect $pair[0] --format '{{.Id}}').Trim()
  if($LASTEXITCODE -ne 0 -or $actual -ne $pair[1]){throw 'Previous release image missing or digest mismatch'}
 }
 $context.apiImage=$previous.apiImage;$context.webImage=$previous.webImage;$context.commit=$previous.commit
 Save-AstraContext $context
 Invoke-AstraCompose $context @('up','-d','--wait','api','web')
 Test-AstraHttp $context $previous.commit | Out-Null
 $previous | ConvertTo-Json -Depth 8 | Set-Content (Join-Path $context.directory 'release.json') -Encoding utf8
 $current | ConvertTo-Json -Depth 8 | Set-Content (Join-Path $context.directory 'previous-release.json') -Encoding utf8
 Write-Output "Application reverted to $($previous.commit). Database preserved."
} finally {$lock.Dispose()}
