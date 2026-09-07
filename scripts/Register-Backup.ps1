[CmdletBinding()]
param()
. "$PSScriptRoot/Common.ps1"
$context=Get-AstraContext staging
$action=New-ScheduledTaskAction -Execute 'powershell.exe' -Argument ('-NoProfile -NonInteractive -ExecutionPolicy Bypass -File "'+(Join-Path $PSScriptRoot 'Backup.ps1')+'" -Environment staging') -WorkingDirectory $script:AstraRoot
$trigger=New-ScheduledTaskTrigger -Daily -At '02:00'
$principal=New-ScheduledTaskPrincipal -UserId ([Security.Principal.WindowsIdentity]::GetCurrent().Name) -LogonType Interactive -RunLevel Limited
$settings=New-ScheduledTaskSettingsSet -StartWhenAvailable -MultipleInstances IgnoreNew -ExecutionTimeLimit (New-TimeSpan -Minutes 15)
Register-ScheduledTask -TaskName "$($context.project)-backup" -Action $action -Trigger $trigger -Principal $principal -Settings $settings -Description 'Daily ASTRA synthetic staging database backup; local host must be on and Docker running.' -Force | Select-Object TaskName,State
