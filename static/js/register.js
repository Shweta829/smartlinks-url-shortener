// Interactive Register Form

const form = document.getElementById('registerForm');
const usernameInput = document.getElementById('username');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirm-password');
const togglePasswordBtn = document.getElementById('togglePassword');
const toggleConfirmPasswordBtn = document.getElementById('toggleConfirmPassword');
const submitBtn = document.getElementById('submitBtn');
const formMessage = document.getElementById('formMessage');

// ========== VALIDATION RULES ==========

const validateUsername = (value) => {
    if (!value.trim()) return { valid: false, message: 'Full name is required' };
    if (value.trim().length < 2) return { valid: false, message: 'Name must be at least 2 characters' };
    if (!/^[a-zA-Z\s'-]+$/.test(value)) return { valid: false, message: 'Name contains invalid characters' };
    return { valid: true };
};

const validateEmail = (value) => {
    if (!value.trim()) return { valid: false, message: 'Email is required' };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return { valid: false, message: 'Invalid email format' };
    return { valid: true };
};

const validatePassword = (value) => {
    if (!value) return { valid: false, message: 'Password is required' };
    if (value.length < 8) return { valid: false, message: 'Minimum 8 characters' };
    if (!/[A-Z]/.test(value)) return { valid: false, message: 'Need uppercase letter' };
    if (!/[a-z]/.test(value)) return { valid: false, message: 'Need lowercase letter' };
    if (!/[0-9]/.test(value)) return { valid: false, message: 'Need a number' };
    return { valid: true };
};

const validateConfirmPassword = (password, confirm) => {
    if (!confirm) return { valid: false, message: 'Please confirm password' };
    if (password !== confirm) return { valid: false, message: 'Passwords do not match' };
    return { valid: true };
};

// ========== PASSWORD STRENGTH ==========

function checkPasswordStrength(password) {
    let strength = 0;
    
    if (password.length >= 8) strength += 20;
    if (password.length >= 12) strength += 10;
    if (/[a-z]/.test(password)) strength += 20;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 15;
    
    let level = 'weak';
    if (strength >= 80) level = 'strong';
    else if (strength >= 50) level = 'fair';
    
    return level;
}

// ========== FIELD VALIDATION & UI UPDATE ==========

function validateField(input, validator) {
    const result = validator(input.value);
    const errorEl = document.getElementById(input.id + '-error');
    const successEl = document.getElementById(input.id + '-success');
    
    if (result.valid) {
        input.classList.remove('error');
        input.classList.add('valid');
        if (errorEl) errorEl.classList.remove('show');
        if (successEl) successEl.classList.add('show');
    } else {
        input.classList.remove('valid');
        input.classList.add('error');
        if (errorEl) {
            errorEl.textContent = result.message;
            errorEl.classList.add('show');
        }
        if (successEl) successEl.classList.remove('show');
    }
    
    return result.valid;
}

// ========== EVENT LISTENERS ==========

// Username validation
usernameInput.addEventListener('blur', () => validateField(usernameInput, validateUsername));
usernameInput.addEventListener('input', () => {
    if (usernameInput.classList.contains('error')) {
        validateField(usernameInput, validateUsername);
    }
});

// Email validation
emailInput.addEventListener('blur', () => validateField(emailInput, validateEmail));
emailInput.addEventListener('input', () => {
    if (emailInput.classList.contains('error')) {
        validateField(emailInput, validateEmail);
    }
});

// Password validation with strength meter
passwordInput.addEventListener('input', () => {
    const strength = checkPasswordStrength(passwordInput.value);
    const strengthBar = document.getElementById('strengthBar');
    const strengthLabel = document.getElementById('strengthLabel');
    
    strengthBar.className = 'strength-bar ' + strength;
    strengthLabel.textContent = 'Strength: ' + strength.charAt(0).toUpperCase() + strength.slice(1);
    
    if (passwordInput.classList.contains('error')) {
        validateField(passwordInput, validatePassword);
    }
    
    // Re-validate confirm password if it has a value
    if (confirmPasswordInput.value) {
        validateField(confirmPasswordInput, (val) => validateConfirmPassword(passwordInput.value, val));
    }
});

passwordInput.addEventListener('blur', () => validateField(passwordInput, validatePassword));

// Confirm password validation
confirmPasswordInput.addEventListener('blur', () => {
    validateField(confirmPasswordInput, (val) => validateConfirmPassword(passwordInput.value, val));
});
confirmPasswordInput.addEventListener('input', () => {
    if (confirmPasswordInput.classList.contains('error')) {
        validateField(confirmPasswordInput, (val) => validateConfirmPassword(passwordInput.value, val));
    }
});

// Password visibility toggle
togglePasswordBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
});

toggleConfirmPasswordBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const isPassword = confirmPasswordInput.type === 'password';
    confirmPasswordInput.type = isPassword ? 'text' : 'password';
});

// Form submission
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const isUsernameValid = validateField(usernameInput, validateUsername);
    const isEmailValid = validateField(emailInput, validateEmail);
    const isPasswordValid = validateField(passwordInput, validatePassword);
    const isConfirmValid = validateField(confirmPasswordInput, (val) => validateConfirmPassword(passwordInput.value, val));
    
    if (!isUsernameValid || !isEmailValid || !isPasswordValid || !isConfirmValid) {
        showMessage('Please fix the errors above', 'error');
        return;
    }
    
    await submitForm();
});

// ========== FORM SUBMISSION ==========

async function submitForm() {
    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Signing Up...';
    
    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                email: email,
                password: password
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage('Account created successfully! Redirecting...', 'success');
            if (data.token) localStorage.setItem('token', data.token);
            setTimeout(() => window.location.href = '/login', 1500);
        } else {
            showMessage(data.message || 'Registration failed', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Sign Up';
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('Network error. Please try again.', 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign Up';
    }
}

// ========== MESSAGE DISPLAY ==========

function showMessage(message, type) {
    formMessage.textContent = message;
    formMessage.className = 'form-message ' + type;
    
    if (type === 'error') {
        setTimeout(() => formMessage.classList.remove('error'), 5000);
    }
}