# Creates a TypeCraft desktop shortcut
$WshShell = New-Object -ComObject WScript.Shell
$Desktop = [System.Environment]::GetFolderPath('Desktop')
$Shortcut = $WshShell.CreateShortcut("$Desktop\TypeCraft.lnk")
$Shortcut.TargetPath = "$PSScriptRoot\TypeCraft.bat"
$Shortcut.WorkingDirectory = $PSScriptRoot
$Shortcut.IconLocation = "C:\Program Files\Google\Chrome\Application\chrome.exe,0"
$Shortcut.Description = "TypeCraft - Leer blind typen!"
$Shortcut.WindowStyle = 7  # Minimized (hides the cmd window)
$Shortcut.Save()
Write-Host "TypeCraft snelkoppeling aangemaakt op het bureaublad!" -ForegroundColor Green
