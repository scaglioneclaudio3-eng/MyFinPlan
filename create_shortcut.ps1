$ErrorActionPreference = "Stop"
$WshShell = New-Object -comObject WScript.Shell
$DesktopPath = [Environment]::GetFolderPath("Desktop")
$ProjectDir = Get-Location
$UnpackedDir = Join-Path $ProjectDir "dist\win-unpacked"

Write-Host "Checking for unpacked app in: $UnpackedDir"

if (Test-Path $UnpackedDir) {
    $ExeFiles = Get-ChildItem -Path $UnpackedDir -Filter "*.exe"
    if ($ExeFiles.Count -gt 0) {
        # Select the main executable (usually the largest one or matching Product Name if logical)
        # We take the largest to avoid potential helper executables, though electron usually puts them in subfolders or they are smaller.
        $TargetExe = $ExeFiles | Sort-Object Length -Descending | Select-Object -First 1
        
        $ShortcutName = "$($TargetExe.BaseName).lnk"
        $ShortcutPath = Join-Path $DesktopPath $ShortcutName
        $Shortcut = $WshShell.CreateShortcut($ShortcutPath)
        $Shortcut.TargetPath = $TargetExe.FullName
        $Shortcut.WorkingDirectory = $UnpackedDir
        $Shortcut.Save()
        Write-Host "Success: Shortcut created at '$ShortcutPath' pointing to '$($TargetExe.FullName)'"
    }
    else {
        Write-Warning "No .exe files found in $UnpackedDir. Please run 'npm run build' first."
    }
}
else {
    Write-Warning "Directory '$UnpackedDir' not found. Please run 'npm run build' first."
}
