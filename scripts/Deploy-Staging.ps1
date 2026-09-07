[CmdletBinding()]
param([switch]$Seed,[switch]$SkipVerify)
. "$PSScriptRoot/Common.ps1"
$context=Get-AstraContext staging -Create
$lock=Enter-AstraLock $context
$previous=$null;$activated=$false;$phase='verification';$sha='unknown'
Push-Location $script:AstraRoot
try {
 $sha=Get-CleanAstraCommit
 if(!$SkipVerify){Invoke-Checked powershell.exe @('-NoProfile','-File',"$PSScriptRoot/Verify.ps1",'-SkipInstall')}
 $verificationPath=Join-Path $script:AstraRoot '.runtime/test/verification.json'
 if(!(Test-Path -LiteralPath $verificationPath)){throw 'Verification required for this commit'}
 $verification=Get-Content -LiteralPath $verificationPath -Raw | ConvertFrom-Json
 if($verification.commit -ne $sha -or $verification.dirty){throw 'Verification must match clean deployment commit'}
 $images=Get-Content images.lock.json -Raw | ConvertFrom-Json
 $releasePath=Join-Path $context.directory 'release.json'
 if(Test-Path -LiteralPath $releasePath){$previous=Get-Content -LiteralPath $releasePath -Raw | ConvertFrom-Json;Test-AstraReleaseImages $previous}
 $phase='build'
 Invoke-Checked docker @('build','--build-arg',"NODE_IMAGE=$($images.node)",'--build-arg',"CADDY_IMAGE=$($images.caddy)",'--build-arg',"GIT_COMMIT=$sha",'--target','api','-t',"astra-api:$sha",'.')
 Invoke-Checked docker @('build','--build-arg',"NODE_IMAGE=$($images.node)",'--build-arg',"CADDY_IMAGE=$($images.caddy)",'--build-arg',"GIT_COMMIT=$sha",'--target','web','-t',"astra-web:$sha",'.')
 $candidate=@{version='0.1.0';commit=$sha;apiImage="astra-api:$sha";webImage="astra-web:$sha";apiDigest=(Get-AstraImageId "astra-api:$sha");webDigest=(Get-AstraImageId "astra-web:$sha");origin=$context.origin;environment='staging';verification=$verification}
 if($previous){$phase='backup';New-AstraBackup $context | Out-Null}
 $activated=$true
 $context.apiImage=$candidate.apiDigest;$context.webImage=$candidate.webDigest;$context.commit=$sha
 Save-AstraContext $context
 $phase='database'
 Invoke-AstraCompose $context @('up','-d','--wait','db')
 $phase='migration'
 Invoke-AstraCompose $context @('run','--rm','--no-deps','api','npm','run','db:migrate')
 if($Seed){$phase='seed';Invoke-AstraCompose $context @('run','--rm','--no-deps','api','npm','run','db:seed')}
 $phase='startup'
 Set-AstraRelease $context $candidate
 $candidate.deployedAt=(Get-Date).ToUniversalTime().ToString('o')
 if($previous -and $previous.commit -ne $sha){Write-AstraJson (Join-Path $context.directory 'previous-release.json') $previous}
 Write-AstraJson $releasePath $candidate
 Write-Output "Staging ready: $($context.origin) | $sha"
} catch {
 $failure=$_
 $recovery='PREVIOUS_RELEASE_UNCHANGED'
 if($activated){
  if($previous){
   try {Set-AstraRelease $context $previous;$recovery='PREVIOUS_IMAGES_RESTORED_DATA_PRESERVED'}
   catch {$recovery='RECOVERY_REQUIRES_INTERVENTION';Write-Warning 'Previous images could not be made healthy. Database and backup are preserved.'}
  }else{
   $recovery='FIRST_DEPLOYMENT_FAILED_DATA_PRESERVED'
   try {Invoke-AstraCompose $context @('stop','api','web') | Out-Null}catch {}
  }
 }
 Write-AstraJson (Join-Path $context.directory 'deployment-failure.json') @{failedAt=(Get-Date).ToUniversalTime().ToString('o');commit=$sha;phase=$phase;recovery=$recovery;migrationReviewRequired=($phase -eq 'migration')}
 throw $failure
} finally {Pop-Location;$lock.Dispose()}
