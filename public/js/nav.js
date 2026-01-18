// Navigation JavaScript (shared across pages)
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupLogout();
    setupBrandLink();
});

function setupBrandLink() {
    // Force nav-brand link to work - simple direct navigation
    const navBrand = document.querySelector('.nav-brand');
    if (navBrand) {
        // Ensure href is set
        if (navBrand.tagName === 'A') {
            navBrand.href = '/';
        } else {
            // Convert to anchor if not already
            const brandContent = navBrand.innerHTML;
            const newLink = document.createElement('a');
            newLink.href = '/';
            newLink.className = 'nav-brand';
            newLink.style.cssText = 'text-decoration: none; cursor: pointer; display: flex; align-items: center; gap: 12px;';
            newLink.innerHTML = brandContent;
            navBrand.parentNode.replaceChild(newLink, navBrand);
        }
        
        // Add explicit click handler as backup - use capture phase
        const link = navBrand.tagName === 'A' ? navBrand : document.querySelector('.nav-brand');
        if (link) {
            link.addEventListener('click', function(e) {
                // Always navigate - don't rely on default behavior
                e.stopImmediatePropagation();
                window.location.href = '/';
                return false;
            }, true); // Use capture phase to catch before other handlers
        }
    }
}

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
