# This script creates a shortcut on the user's desktop to launch the Excel2Desktop application.
# It points to the 'abrir_aplicativo.bat' file located in this project directory.

$WshShell = New-Object -ComObject WScript.Shell
$ShortcutPath = [System.IO.Path]::Combine([Environment]::GetFolderPath("Desktop"), "MyFinPlan.lnk")
$TargetPath = Join-Path -Path $PSScriptRoot -ChildPath "abrir_aplicativo.bat"

$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = $TargetPath
$Shortcut.WorkingDirectory = $PSScriptRoot
$Shortcut.Description = "Abrir o MyFinPlan (Excel2Desktop App)"
$Shortcut.IconLocation = "$TargetPath,0"
$Shortcut.Save()

Write-Host "Atalho 'MyFinPlan' criado na sua Área de Trabalho com sucesso!" -ForegroundColor Green
