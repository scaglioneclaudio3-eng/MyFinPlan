' VBScript to create a desktop shortcut for the Excel2Desktop App
Set objShell = CreateObject("WScript.Shell")
strDesktop = objShell.SpecialFolders("Desktop")
strProjectPath = "c:\Users\User\coding-projects\excel2desktop-app"
strShortcutPath = strDesktop & "\MyFinPlan.lnk"

Set objShortcut = objShell.CreateShortcut(strShortcutPath)
objShortcut.TargetPath = strProjectPath & "\abrir_aplicativo.bat"
objShortcut.WorkingDirectory = strProjectPath
objShortcut.Description = "Abrir o MyFinPlan (Excel2Desktop App)"
objShortcut.Save

WScript.Echo "Atalho criado com sucesso na Area de Trabalho!"
