[CmdletBinding()]
param([Parameter(Mandatory)][ValidatePattern('^[a-zA-Z0-9.-]+$')][string]$Hostname,[ValidateRange(1024,65535)][int]$Port=4443)
. "$PSScriptRoot/Common.ps1"
$context=Get-AstraContext staging
$lock=Enter-AstraLock $context
try {
 $context.origin="https://"+$Hostname+":"+$Port
 $context.webPort=$Port;$context.webContainerPort=8443;$context.bindAddress='0.0.0.0';$context.cookieSecure='true'
 Save-AstraContext $context
 Invoke-AstraCompose $context @('up','-d','--wait','api','web')
 Invoke-AstraCompose $context @('cp','web:/data/caddy/pki/authorities/local/root.crt',(Join-Path $context.directory 'lan-ca.crt'))
 Write-Output "LAN HTTPS: $($context.origin). Certificate authority exported to $($context.directory)/lan-ca.crt."
 Write-Output 'Each client must explicitly trust this local CA using its normal certificate management before using the LAN deployment. Firewall reachability must be verified on the private network.'
} finally {$lock.Dispose()}
