// Interactive Login Form

const form = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const togglePasswordBtn = document.getElementById('togglePassword');
const submitBtn = document.getElementById('submitBtn');
const formMessage = document.getElementById('formMessage');

// ========== VALIDATION RULES ==========

const validateEmail = (value) => {
    if (!value.trim()) return { valid: false, message: 'Email is required' };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return { valid: false, message: 'Invalid email format' };
    return { valid: true };
};

const validatePassword = (value) => {
    if (!value) return { valid: false, message: 'Password is required' };
    return { valid: true };
};

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

// Email validation
emailInput.addEventListener('blur', () => validateField(emailInput, validateEmail));
emailInput.addEventListener('input', () => {
    if (emailInput.classList.contains('error')) {
        validateField(emailInput, validateEmail);
    }
});

// Password validation
passwordInput.addEventListener('blur', () => validateField(passwordInput, validatePassword));
passwordInput.addEventListener('input', () => {
    if (passwordInput.classList.contains('error')) {
        validateField(passwordInput, validatePassword);
    }
});

// Password visibility toggle
togglePasswordBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
});

// Form submission
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Validate fields
    const isEmailValid = validateField(emailInput, validateEmail);
    const isPasswordValid = validateField(passwordInput, validatePassword);
    
    if (!isEmailValid || !isPasswordValid) {
        showMessage('Please fix the errors above', 'error');
        return;
    }
    
    await submitForm();
});

// ========== FORM SUBMISSION ==========

async function submitForm() {
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Signing In...';
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });
        
        const data = await response.json();
        
        if (response.ok && data.token) {
            localStorage.setItem('token', data.token);
            showMessage('Login successful! Redirecting...', 'success');
            setTimeout(() => window.location.href = '/dashboard', 1000);
        } else {
            showMessage(data.message || 'Invalid credentials', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Sign In';
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('Network error. Please try again.', 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign In';
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