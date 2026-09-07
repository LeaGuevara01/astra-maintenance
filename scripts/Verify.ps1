[CmdletBinding()]
param([switch]$SkipInstall)
. "$PSScriptRoot/Common.ps1"
$savedEnvironment=@{}
foreach($name in @('DATABASE_URL','TEST_DATABASE_URL','APP_ORIGIN','APP_ENVIRONMENT','COOKIE_SECURE','PORT','WEB_PORT','API_TARGET','SEED_ADMIN_PASSWORD','SEED_TECH_PASSWORD','SEED_VIEWER_PASSWORD','NODE_ENV')){$savedEnvironment[$name]=[Environment]::GetEnvironmentVariable($name,'Process')}
$lock=$null
Push-Location $script:AstraRoot
try {
 $context=Get-AstraContext test -Create
 $lock=Enter-AstraLock $context
 Save-AstraContext $context
 Set-AstraLocalEnvironment $context
 $env:NODE_ENV='test'
 if(!$SkipInstall){Invoke-Checked npm.cmd @('ci')}
 Invoke-Checked npm.cmd @('run','db:generate')
 Invoke-AstraCompose $context @('up','-d','--wait','db')
 Invoke-Checked npm.cmd @('run','db:migrate')
 Invoke-Checked npm.cmd @('run','typecheck')
 Invoke-Checked npm.cmd @('test')
 $env:NODE_ENV='production'
 Invoke-Checked npm.cmd @('run','build')
 $record=@{checkedAt=(Get-Date).ToUniversalTime().ToString('o');commit=(& git rev-parse HEAD).Trim();dirty=[bool](& git status --porcelain);checks=@('typecheck','tests','build');environment=$context.project}
 $record | ConvertTo-Json | Set-Content (Join-Path $context.directory 'verification.json') -Encoding utf8
} finally {
 if($lock){$lock.Dispose()}
 foreach($name in $savedEnvironment.Keys){[Environment]::SetEnvironmentVariable($name,$savedEnvironment[$name],'Process')}
 Pop-Location
}
