# Database Audit Tool

AI-Powered Database Script Analysis Platform for IT Auditors

## 🚀 Features

- **AI-Powered Analysis**: Advanced AI algorithms scan database scripts to identify security vulnerabilities, compliance issues, and potential risks
- **Multi-Database Support**: Supports MS SQL Server, SAP HANA, Oracle, PostgreSQL, MySQL, MongoDB, DB2, and more
- **Risk Assessment**: Detailed risk classifications (high, medium, low) to prioritize critical security issues
- **Excel & Script Upload**: Upload Excel files (.xlsx, .xls) or script files (.sql, .txt, .js, .py)
- **Analysis History**: Track all analyses with detailed history, filter by database type, and monitor risk trends
- **User Authentication**: Secure login and registration system with user profiles

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm (comes with Node.js)
- OpenAI API key (for AI analysis)

## 🛠️ Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd db-audit-app
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
PORT=3000
OPENAI_API_KEY=your_openai_api_key_here
SESSION_SECRET=your_session_secret_here
DATABASE_PATH=./database/audit_results.db
```

4. Start the server:
```bash
npm start
```

5. Open your browser and navigate to:
```
http://localhost:3000
```

## 📁 Project Structure

```
db-audit-app/
├── public/              # Frontend files
│   ├── css/            # Stylesheets
│   ├── js/             # Client-side JavaScript
│   ├── *.html          # HTML pages
│   └── uploads/        # Uploaded files (gitignored)
├── server/             # Backend files
│   ├── routes/         # API routes
│   ├── models/         # Database models
│   └── services/       # Business logic
├── database/           # SQLite database (gitignored)
├── scripts/            # Utility scripts
└── package.json        # Dependencies
```

## 🔐 Default Credentials

- **Username**: `admin`
- **Password**: `admin123`

⚠️ **Change these credentials in production!**

## 🎯 Usage

1. **Register/Login**: Create an account or login with default credentials
2. **Upload Scripts**: Select your database type and upload Excel or script files
3. **View Analysis**: Get detailed security analysis with risk assessments
4. **Track History**: Monitor all your analyses in the dashboard

## 🛡️ Security Features

- Password hashing with bcrypt
- Session-based authentication
- SQL injection protection
- File upload validation
- Database type verification

## 🔧 Configuration

### Environment Variables

- `PORT`: Server port (default: 3000)
- `OPENAI_API_KEY`: Your OpenAI API key (required for AI analysis)
- `SESSION_SECRET`: Secret key for session encryption
- `DATABASE_PATH`: Path to SQLite database file

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Analysis
- `POST /api/analysis/analyze` - Analyze database script
- `GET /api/dashboard/history` - Get analysis history

## 🚀 Deployment

### Deploy to Heroku

1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create your-app-name`
4. Set environment variables:
```bash
heroku config:set OPENAI_API_KEY=your_key
heroku config:set SESSION_SECRET=your_secret
```
5. Deploy: `git push heroku main`

### Deploy to Vercel/Netlify

Note: This app requires a Node.js backend, so you'll need to deploy the server separately or use a platform that supports Node.js.

## 📄 License

ISC

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For support, email support@dbaudit.com or open an issue in the repository.
