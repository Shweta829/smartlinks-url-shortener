// Login Form Interactive Features

const form = document.getElementById('loginForm');
const submitBtn = document.getElementById('submitBtn');
const messageContainer = document.getElementById('messageContainer');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const togglePasswordBtn = document.getElementById('togglePassword');
const rememberMeCheckbox = document.getElementById('rememberMe');

// ========== VALIDATION HELPERS ==========

const validators = {
    email: (value) => {
        if (!value.trim()) return { valid: false, message: 'Email is required' };
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return { valid: false, message: 'Please enter a valid email' };
        return { valid: true };
    },
    
    password: (value) => {
        if (!value) return { valid: false, message: 'Password is required' };
        if (value.length < 6) return { valid: false, message: 'Invalid password' };
        return { valid: true };
    }
};

// ========== FIELD VALIDATION ==========

function validateField(input) {
    const value = input.value;
    let result;
    
    switch(input.id) {
        case 'email':
            result = validators.email(value);
            break;
        case 'password':
            result = validators.password(value);
            break;
        default:
            return;
    }
    
    updateFieldUI(input, result);
    return result.valid;
}

function updateFieldUI(input, result) {
    const wrapper = input.closest('.input-wrapper');
    const feedback = wrapper.querySelector('.validation-feedback');
    
    if (result.valid) {
        input.classList.remove('error');
        input.classList.add('success');
        if (feedback) feedback.textContent = '';
    } else {
        input.classList.remove('success');
        input.classList.add('error');
        if (feedback) feedback.textContent = result.message;
    }
}

// ========== EVENT LISTENERS ==========

// Real-time validation
emailInput.addEventListener('blur', () => validateField(emailInput));
emailInput.addEventListener('input', () => {
    if (emailInput.classList.contains('error')) validateField(emailInput);
});

passwordInput.addEventListener('blur', () => validateField(passwordInput));
passwordInput.addEventListener('input', () => {
    if (passwordInput.classList.contains('error')) validateField(passwordInput);
});

// Password visibility toggle
togglePasswordBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    togglePasswordBtn.classList.toggle('showing');
});

// Form submission
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Validate fields
    const isEmailValid = validateField(emailInput);
    const isPasswordValid = validateField(passwordInput);
    
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
    
    // Show loading state
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');
    
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
            // Store token
            localStorage.setItem('token', data.token);
            
            // Store email if "Remember Me" is checked
            if (rememberMeCheckbox.checked) {
                localStorage.setItem('rememberedEmail', email);
            } else {
                localStorage.removeItem('rememberedEmail');
            }
            
            showMessage('Login successful! Redirecting...', 'success');
            
            // Redirect after short delay
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 1000);
        } else {
            showMessage(data.message || 'Invalid email or password', 'error');
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
        }
    } catch (error) {
        console.error('Login error:', error);
        showMessage('An error occurred. Please try again later.', 'error');
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
    }
}

// ========== MESSAGE DISPLAY ==========

function showMessage(message, type) {
    messageContainer.textContent = message;
    messageContainer.className = `message-container ${type}`;
    
    // Auto-hide error messages after 5 seconds
    if (type === 'error') {
        setTimeout(() => {
            messageContainer.classList.remove('error');
            messageContainer.textContent = '';
        }, 5000);
    }
}

// ========== INITIAL SETUP ==========

// Load remembered email if available
window.addEventListener('DOMContentLoaded', () => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
        emailInput.value = rememberedEmail;
        rememberMeCheckbox.checked = true;
    }
});

// Clear error messages on input focus
[emailInput, passwordInput].forEach(input => {
    input.addEventListener('focus', () => {
        messageContainer.textContent = '';
    });
});
