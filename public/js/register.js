// Registration JavaScript
document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const registerBtn = document.getElementById('registerBtn');
    const registerError = document.getElementById('registerError');
    const btnText = registerBtn.querySelector('.btn-text');
    const btnLoader = registerBtn.querySelector('.btn-loader');

    // Check if already logged in
    checkAuthStatus();

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const fullName = document.getElementById('fullName').value.trim();
        const username = document.getElementById('username').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Validation
        if (!username || !email || !password) {
            showError('Please fill in all required fields');
            return;
        }

        if (password.length < 6) {
            showError('Password must be at least 6 characters long');
            return;
        }

        if (password !== confirmPassword) {
            showError('Passwords do not match');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showError('Please enter a valid email address');
            return;
        }

        // Show loading state
        registerBtn.disabled = true;
        btnText.classList.add('hidden');
        btnLoader.classList.remove('hidden');
        hideError();

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ 
                    username, 
                    email, 
                    password, 
                    fullName: fullName || null 
                })
            });

            let data;
            try {
                data = await response.json();
            } catch (jsonError) {
                console.error('JSON parse error:', jsonError);
                showError('Server error. Please try again.');
                return;
            }

            if (response.ok && data.success) {
                // Show success message briefly, then redirect
                showSuccess('Account created successfully! Redirecting...');
                setTimeout(() => {
                    window.location.href = data.redirect || '/home';
                }, 1000);
            } else {
                const errorMessage = data.message || data.error || 'Registration failed. Please try again.';
                console.error('Registration failed:', data);
                showError(errorMessage);
            }
        } catch (error) {
            console.error('Registration error:', error);
            showError('Network error. Please check your connection and try again.');
        } finally {
            // Reset button state
            registerBtn.disabled = false;
            btnText.classList.remove('hidden');
            btnLoader.classList.add('hidden');
        }
    });

    function showError(message) {
        registerError.textContent = message;
        registerError.classList.remove('hidden');
        registerError.style.color = '#d32f2f';
    }

    function showSuccess(message) {
        registerError.textContent = message;
        registerError.classList.remove('hidden');
        registerError.style.color = '#2e7d32';
    }

    function hideError() {
        registerError.classList.add('hidden');
    }

    async function checkAuthStatus() {
        try {
            const response = await fetch('/api/auth/me', {
                credentials: 'include'
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    window.location.href = '/home';
                }
            }
        } catch (error) {
            // Not logged in, stay on register page
        }
    }
});
