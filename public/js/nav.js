// Navigation JavaScript (shared across pages)
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupLogout();
});

async function checkAuth() {
    try {
        const response = await fetch('/api/auth/me', {
            credentials: 'include'
        });

        if (!response.ok) {
            // Only redirect if not already on login/register/landing pages
            if (!window.location.pathname.includes('/login') && 
                !window.location.pathname.includes('/register') &&
                !window.location.pathname.includes('/landing') &&
                window.location.pathname !== '/') {
                window.location.href = '/login';
            }
            return;
        }

        const data = await response.json();
        if (data.success) {
            // Update user name display - use fullName if available, otherwise username
            const userNameEl = document.getElementById('userName');
            if (userNameEl) {
                userNameEl.textContent = data.user.fullName || data.user.username;
            }
            
            // Update user full name if element exists
            const userFullNameEl = document.getElementById('userFullName');
            if (userFullNameEl) {
                userFullNameEl.textContent = data.user.fullName || data.user.username;
            }
        } else {
            window.location.href = '/login';
        }
    } catch (error) {
        console.error('Auth check error:', error);
        window.location.href = '/login';
    }
}

function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
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
        });
    }
}
