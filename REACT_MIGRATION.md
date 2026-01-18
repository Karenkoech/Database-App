# React Migration Guide

## Overview
The application has been successfully migrated from vanilla JavaScript to React with a component-based architecture using React Router for navigation.

## Project Structure

```
src/
├── main.jsx                 # React entry point
├── App.jsx                  # Main app component with routing
├── index.css                # Global styles (imports existing CSS)
├── contexts/
│   └── AuthContext.jsx      # Authentication context provider
├── components/
│   ├── Navbar.jsx          # Navigation bar component
│   ├── FileUpload.jsx       # File upload component
│   └── ErrorModal.jsx      # Error modal component
├── pages/
│   ├── Landing.jsx         # Landing page
│   ├── Login.jsx           # Login page
│   ├── Register.jsx        # Registration page
│   ├── Home.jsx            # Home page (logged in)
│   ├── Dashboard.jsx       # Dashboard page
│   └── Contact.jsx         # Contact page
└── hooks/
    ├── useDashboard.js     # Dashboard data hook
    └── useFileUpload.js    # File upload hook
```

## Key Features

### 1. Component-Based Architecture
- Each page is now a React component
- Reusable components (Navbar, FileUpload, ErrorModal)
- Custom hooks for shared logic (useDashboard, useFileUpload)

### 2. React Router
- Client-side routing with React Router v7
- Protected routes for authenticated pages
- Public routes that redirect if already logged in

### 3. Context API
- AuthContext manages user authentication state
- Provides login, register, logout, and auth check functions

### 4. Custom Hooks
- `useDashboard`: Manages dashboard data, stats, filtering, and history
- `useFileUpload`: Handles file selection, validation, and analysis

## Running the Application

### Development Mode

1. **Start the backend server:**
   ```bash
   npm start
   # or
   npm run dev
   ```

2. **Start the React development server (in a new terminal):**
   ```bash
   npm run dev:client
   ```
   This starts Vite dev server on `http://localhost:5173`

3. **Access the app:**
   - React app: `http://localhost:5173`
   - Backend API: `http://localhost:3000`
   - Vite proxies `/api` requests to the backend automatically

### Production Build

1. **Build the React app:**
   ```bash
   npm run build
   ```

2. **Start the server (serves React build):**
   ```bash
   NODE_ENV=production npm start
   ```

## Migration Details

### What Changed

1. **HTML Pages → React Components**
   - Each HTML page converted to a React component
   - Preserved all existing functionality and styling

2. **Vanilla JS → React Hooks**
   - DOM manipulation replaced with React state and effects
   - Event listeners replaced with React event handlers

3. **Navigation**
   - `window.location.href` replaced with React Router `Link` and `useNavigate`
   - Client-side routing for faster navigation

4. **State Management**
   - Local state with `useState`
   - Shared state with Context API
   - Custom hooks for reusable logic

### What Stayed the Same

- All CSS styles preserved
- Backend API endpoints unchanged
- Database schema unchanged
- Authentication flow unchanged
- File upload functionality preserved

## Development Workflow

1. **Backend changes:** Edit files in `server/` directory
2. **Frontend changes:** Edit files in `src/` directory
3. **Styling:** Edit CSS files in `public/css/` (imported in `src/index.css`)

## Troubleshooting

### Port Conflicts
- Backend runs on port 3000
- Vite dev server runs on port 5173
- If ports are in use, change them in `server/index.js` and `vite.config.js`

### API Proxy Issues
- Ensure backend is running before starting Vite
- Check `vite.config.js` proxy configuration

### Build Issues
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`

## Next Steps

- [ ] Add TypeScript for type safety
- [ ] Implement React Query for better data fetching
- [ ] Add unit tests with Jest and React Testing Library
- [ ] Optimize bundle size with code splitting
- [ ] Add error boundaries for better error handling
