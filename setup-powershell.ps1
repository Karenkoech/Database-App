# PowerShell Setup Script
# Run this in your PowerShell window to refresh PATH for this session

# Refresh PATH environment variable
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Navigate to project directory
cd "E:\project-DB app"

# Verify commands work
Write-Host "Checking Git..." -ForegroundColor Green
git --version

Write-Host "`nChecking Node.js..." -ForegroundColor Green
node --version

Write-Host "`nCurrent location:" -ForegroundColor Green
Get-Location

Write-Host "`n✅ Ready to work! You can now use git and node commands." -ForegroundColor Green
