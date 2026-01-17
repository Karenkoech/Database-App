// Contact page JavaScript
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupEventListeners();
});

function setupEventListeners() {
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Contact form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
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
            const userNameEl = document.getElementById('userName');
            if (userNameEl) {
                userNameEl.textContent = data.user.fullName || data.user.username;
            }
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

async function handleContactSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('.submit-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');
    const successMsg = document.getElementById('contactSuccess');
    const errorMsg = document.getElementById('contactError');

    // Hide previous messages
    successMsg.classList.add('hidden');
    errorMsg.classList.add('hidden');

    // Show loading
    submitBtn.disabled = true;
    btnText.classList.add('hidden');
    btnLoader.classList.remove('hidden');

    // Simulate form submission (in production, this would send to a backend)
    setTimeout(() => {
        // Show success message
        successMsg.classList.remove('hidden');
        form.reset();

        // Reset button
        submitBtn.disabled = false;
        btnText.classList.remove('hidden');
        btnLoader.classList.add('hidden');

        // Scroll to success message
        successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 1000);
}
