$WshShell = New-Object -ComObject WScript.Shell
$WorkspacePath = "c:\Users\User\coding-projects\excel2desktop-app"
$ShortcutPath = Join-Path -Path $WorkspacePath -ChildPath "Finanças Pessoais.lnk"
$TargetPath = Join-Path -Path $WorkspacePath -ChildPath "abrir_aplicativo.bat"
$IconPath = Join-Path -Path $WorkspacePath -ChildPath "src\renderer\assets\icon.ico"

$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = $TargetPath
$Shortcut.WorkingDirectory = $WorkspacePath
$Shortcut.Description = "Abrir o MyFinPlan (Dev)"
$Shortcut.IconLocation = $IconPath
$Shortcut.Save()

Write-Host "Atalho criado em: $ShortcutPath" -ForegroundColor Green
