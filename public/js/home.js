// Home page JavaScript
document.addEventListener('DOMContentLoaded', async () => {
    // Update user name
    await updateUserName();
    
    // Load stats preview
    await loadStatsPreview();
});

async function updateUserName() {
    try {
        const response = await fetch('/api/auth/me', {
            credentials: 'include'
        });

        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                const displayName = data.user.fullName || data.user.username;
                const userNameEl = document.getElementById('userName');
                const userFullNameEl = document.getElementById('userFullName');
                if (userNameEl) userNameEl.textContent = displayName;
                if (userFullNameEl) userFullNameEl.textContent = displayName;
            }
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
}

async function loadStatsPreview() {
    try {
        const response = await fetch('/api/dashboard/history', {
            credentials: 'include'
        });

        if (response.ok) {
            const data = await response.json();
            if (data.success && data.history) {
                const history = data.history;
                
                // Calculate stats
                let totalAnalyses = history.length;
                let highRisk = 0;
                let mediumRisk = 0;
                let lowRisk = 0;

                history.forEach(item => {
                    const risk = item.riskAssessment?.overallRisk || 'low';
                    if (risk === 'high') highRisk++;
                    else if (risk === 'medium') mediumRisk++;
                    else lowRisk++;
                });

                // Update UI
                const totalEl = document.getElementById('totalAnalyses');
                const highEl = document.getElementById('highRiskCount');
                const mediumEl = document.getElementById('mediumRiskCount');
                const lowEl = document.getElementById('lowRiskCount');

                if (totalEl) totalEl.textContent = totalAnalyses;
                if (highEl) highEl.textContent = highRisk;
                if (mediumEl) mediumEl.textContent = mediumRisk;
                if (lowEl) lowEl.textContent = lowRisk;
            }
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}
