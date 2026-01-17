// Dashboard JavaScript
let currentUser = null;
let analysisHistory = [];
let isInitialLoad = true; // Track if this is the first load

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupEventListeners();
    // Show "No history" by default on initial load
    showNoHistory();
    // Load dashboard data silently in background
    loadDashboardSilent();
});

function setupEventListeners() {
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // DB filter
    const dbFilter = document.getElementById('dbFilter');
    if (dbFilter) {
        dbFilter.addEventListener('change', () => {
            filterHistory();
        });
    }

    // Refresh button
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            isInitialLoad = false; // Mark as user action
            loadDashboard();
        });
    }
}

async function checkAuth() {
    try {
        const response = await fetch('/api/auth/me', {
            credentials: 'include'
        });

        if (!response.ok) {
            window.location.href = '/login';
            return;
        }

        const data = await response.json();
        if (data.success) {
            currentUser = data.user;
            const displayName = currentUser.fullName || currentUser.username;
            const userNameEl = document.getElementById('userName');
            const userFullNameEl = document.getElementById('userFullName');
            if (userNameEl) userNameEl.textContent = displayName;
            if (userFullNameEl) userFullNameEl.textContent = displayName;
        } else {
            window.location.href = '/login';
        }
    } catch (error) {
        console.error('Auth check error:', error);
        window.location.href = '/login';
    }
}

async function handleLogout() {
    try {
        const response = await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });

        if (response.ok) {
            window.location.href = '/login';
        }
    } catch (error) {
        console.error('Logout error:', error);
        window.location.href = '/login';
    }
}

// Silent load for initial page load - never shows errors
async function loadDashboardSilent() {
    try {
        const response = await fetch('/api/dashboard/history', {
            credentials: 'include'
        });

        if (!response.ok) {
            // Silently fail on initial load - keep showing "No history"
            return;
        }

        const data = await response.json();
        if (data.success) {
            analysisHistory = data.history || [];
            updateStats();
            if (analysisHistory.length > 0) {
                displayHistory(analysisHistory);
            } else {
                // Keep showing "No history" if empty
                showNoHistory();
            }
            isInitialLoad = false; // Mark as loaded after first successful load
        }
    } catch (error) {
        console.error('Error loading dashboard:', error);
        // Silently fail on initial load - keep showing "No history"
    }
}

// Load dashboard with user feedback (for refresh button, etc.)
async function loadDashboard() {
    const historyContainer = document.getElementById('historyContainer');
    
    // Show loading state for user actions
    historyContainer.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>Loading history...</p></div>';

    try {
        const response = await fetch('/api/dashboard/history', {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to load history');
        }

        const data = await response.json();
        if (data.success) {
            analysisHistory = data.history || [];
            updateStats();
            displayHistory(analysisHistory);
            isInitialLoad = false;
        } else {
            showError('Failed to load history. Please try again.');
        }
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showError('Failed to load history. Please try again.');
    }
}

function showNoHistory() {
    const historyContainer = document.getElementById('historyContainer');
    historyContainer.innerHTML = `
        <div class="empty-state">
            <div class="empty-icon">📭</div>
            <h3>No Analysis History</h3>
            <p>Upload your first database script to see analysis results here.</p>
            <button onclick="document.querySelector('.upload-section')?.scrollIntoView({behavior: 'smooth'})" class="upload-link-btn" style="cursor: pointer; border: none; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 24px; border-radius: 8px; font-weight: 600; text-decoration: none; display: inline-block;">📁 Upload Script</button>
        </div>
    `;
}

function showError(message) {
    const historyContainer = document.getElementById('historyContainer');
    const retryBtn = document.createElement('button');
    retryBtn.textContent = 'Retry';
    retryBtn.style.cssText = 'margin-top: 15px; padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;';
    retryBtn.onclick = () => {
        isInitialLoad = false;
        loadDashboard();
    };
    
    historyContainer.innerHTML = `
        <div class="error-state">
            <p>❌ ${message}</p>
        </div>
    `;
    historyContainer.querySelector('.error-state').appendChild(retryBtn);
}

function updateStats() {
    const total = analysisHistory.length;
    let highRisk = 0;
    let mediumRisk = 0;
    let lowRisk = 0;

    analysisHistory.forEach(item => {
        const risk = item.riskAssessment?.overallRisk || 'low';
        if (risk === 'high') highRisk++;
        else if (risk === 'medium') mediumRisk++;
        else lowRisk++;
    });

    document.getElementById('totalAnalyses').textContent = total;
    document.getElementById('highRiskCount').textContent = highRisk;
    document.getElementById('mediumRiskCount').textContent = mediumRisk;
    document.getElementById('lowRiskCount').textContent = lowRisk;
}

function filterHistory() {
    isInitialLoad = false; // Mark as user action
    const dbFilter = document.getElementById('dbFilter');
    const selectedDb = dbFilter.value;

    let filtered = analysisHistory;
    if (selectedDb) {
        filtered = analysisHistory.filter(item => item.db_type === selectedDb);
    }

    displayHistory(filtered);
}

function displayHistory(history) {
    const historyContainer = document.getElementById('historyContainer');

    if (history.length === 0) {
        historyContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📭</div>
                <h3>No Analysis History</h3>
                <p>Upload your first database script to see analysis results here.</p>
                <button onclick="document.querySelector('.upload-section')?.scrollIntoView({behavior: 'smooth'})" class="upload-link-btn" style="cursor: pointer; border: none; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 24px; border-radius: 8px; font-weight: 600; text-decoration: none; display: inline-block;">📁 Upload Script</button>
            </div>
        `;
        return;
    }

    historyContainer.innerHTML = history.map(item => {
        const risk = item.riskAssessment?.overallRisk || 'low';
        const riskClass = `risk-${risk}`;
        const riskIcon = risk === 'high' ? '🔴' : risk === 'medium' ? '🟡' : '🟢';
        const date = new Date(item.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        const dbType = item.db_type || 'Unknown';
        const issues = item.aiAnalysis?.issues || [];
        const highRiskIssues = issues.filter(i => i.severity === 'high').length;
        const mediumRiskIssues = issues.filter(i => i.severity === 'medium').length;
        const lowRiskIssues = issues.filter(i => i.severity === 'low').length;

        return `
            <div class="history-item">
                <div class="history-header">
                    <div class="history-title">
                        <span class="history-icon">📄</span>
                        <div>
                            <h3>${escapeHtml(item.filename)}</h3>
                            <p class="history-meta">
                                <span class="db-badge">${escapeHtml(dbType)}</span>
                                <span class="date-badge">${date}</span>
                            </p>
                        </div>
                    </div>
                    <div class="history-risk ${riskClass}">
                        <span class="risk-icon">${riskIcon}</span>
                        <span class="risk-text">${risk.toUpperCase()} RISK</span>
                    </div>
                </div>
                <div class="history-stats">
                    <div class="stat-item">
                        <span class="stat-label">High:</span>
                        <span class="stat-value high">${highRiskIssues}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Medium:</span>
                        <span class="stat-value medium">${mediumRiskIssues}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Low:</span>
                        <span class="stat-value low">${lowRiskIssues}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Total Issues:</span>
                        <span class="stat-value">${issues.length}</span>
                    </div>
                </div>
                ${issues.length > 0 ? `
                    <div class="history-issues">
                        <h4>Key Issues:</h4>
                        <ul>
                            ${issues.slice(0, 3).map(issue => `
                                <li class="issue-item issue-${issue.severity}">
                                    <span class="issue-severity">${issue.severity.toUpperCase()}</span>
                                    ${escapeHtml(issue.description)}
                                </li>
                            `).join('')}
                        </ul>
                        ${issues.length > 3 ? `<p class="more-issues">+${issues.length - 3} more issues</p>` : ''}
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
