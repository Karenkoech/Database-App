# Setting Up GitHub Repository

Follow these steps to commit your code to GitHub:

## Step 1: Install Git (if not installed)

1. Download Git from: https://git-scm.com/download/win
2. Install with default settings
3. Restart your terminal/PowerShell

## Step 2: Initialize Git Repository

Open PowerShell in the project directory and run:

```powershell
cd C:\Users\ACE\db-audit-app

# Initialize git repository
git init

# Configure git (if not already done)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## Step 3: Create GitHub Repository

1. Go to https://github.com
2. Click "New repository"
3. Name it: `db-audit-app` (or your preferred name)
4. **DO NOT** initialize with README, .gitignore, or license (we already have these)
5. Click "Create repository"

## Step 4: Add and Commit Files

```powershell
# Add all files
git add .

# Check what will be committed
git status

# Commit files
git commit -m "Initial commit: Database Audit Tool with authentication and AI analysis"
```

## Step 5: Connect to GitHub and Push

```powershell
# Add remote repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/db-audit-app.git

# Or if using SSH:
# git remote add origin git@github.com:YOUR_USERNAME/db-audit-app.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 6: Verify

1. Go to your GitHub repository
2. You should see all your files uploaded
3. The `.gitignore` file should prevent sensitive files from being uploaded

## Important Notes

⚠️ **Before pushing, make sure:**
- `.env` file is NOT committed (it's in .gitignore)
- Database files are NOT committed (they're in .gitignore)
- `node_modules` is NOT committed (it's in .gitignore)

## Future Updates

After making changes:

```powershell
# Check what changed
git status

# Add changed files
git add .

# Commit changes
git commit -m "Description of your changes"

# Push to GitHub
git push
```

## Environment Variables for Deployment

When deploying, you'll need to set these environment variables:
- `OPENAI_API_KEY`
- `SESSION_SECRET`
- `PORT` (optional, defaults to 3000)
