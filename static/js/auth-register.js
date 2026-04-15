// Register Form Interactive Features

const form = document.getElementById('registerForm');
const submitBtn = document.getElementById('submitBtn');
const messageContainer = document.getElementById('messageContainer');
const fullnameInput = document.getElementById('fullname');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');
const togglePasswordBtn = document.getElementById('togglePassword');
const toggleConfirmPasswordBtn = document.getElementById('toggleConfirmPassword');
const strengthFill = document.getElementById('strengthFill');
const strengthText = document.getElementById('strengthText');

// ========== VALIDATION HELPERS ==========

const validators = {
    fullname: (value) => {
        if (!value.trim()) return { valid: false, message: 'Full name is required' };
        if (value.trim().length < 2) return { valid: false, message: 'Name must be at least 2 characters' };
        if (!/^[a-zA-Z\s'-]+$/.test(value)) return { valid: false, message: 'Name contains invalid characters' };
        return { valid: true };
    },
    
    email: (value) => {
        if (!value.trim()) return { valid: false, message: 'Email is required' };
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return { valid: false, message: 'Please enter a valid email' };
        return { valid: true };
    },
    
    password: (value) => {
        if (!value) return { valid: false, message: 'Password is required' };
        if (value.length < 8) return { valid: false, message: 'Password must be at least 8 characters' };
        if (!/[A-Z]/.test(value)) return { valid: false, message: 'Must contain uppercase letter' };
        if (!/[a-z]/.test(value)) return { valid: false, message: 'Must contain lowercase letter' };
        if (!/[0-9]/.test(value)) return { valid: false, message: 'Must contain a number' };
        return { valid: true };
    },
    
    confirmPassword: (password, confirmPassword) => {
        if (!confirmPassword) return { valid: false, message: 'Please confirm your password' };
        if (password !== confirmPassword) return { valid: false, message: 'Passwords do not match' };
        return { valid: true };
    }
};

// ========== FIELD VALIDATION ==========

function validateField(input) {
    const value = input.value;
    let result;
    
    switch(input.id) {
        case 'fullname':
            result = validators.fullname(value);
            break;
        case 'email':
            result = validators.email(value);
            break;
        case 'password':
            result = validators.password(value);
            updatePasswordStrength(value);
            break;
        case 'confirmPassword':
            result = validators.confirmPassword(passwordInput.value, value);
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

// ========== PASSWORD STRENGTH ==========

function updatePasswordStrength(password) {
    let strength = 0;
    
    if (password.length >= 8) strength += 20;
    if (password.length >= 12) strength += 20;
    if (/[a-z]/.test(password)) strength += 15;
    if (/[A-Z]/.test(password)) strength += 15;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 15;
    
    let strengthLevel = 'weak';
    let strengthColor = '#ef4444';
    
    if (strength >= 80) {
        strengthLevel = 'strong';
        strengthColor = '#10b981';
    } else if (strength >= 50) {
        strengthLevel = 'fair';
        strengthColor = '#f59e0b';
    }
    
    strengthFill.className = `strength-fill ${strengthLevel}`;
    strengthText.textContent = strengthLevel.charAt(0).toUpperCase() + strengthLevel.slice(1);
}

// ========== EVENT LISTENERS ==========

// Real-time validation
fullnameInput.addEventListener('blur', () => validateField(fullnameInput));
fullnameInput.addEventListener('input', () => {
    if (fullnameInput.classList.contains('error')) validateField(fullnameInput);
});

emailInput.addEventListener('blur', () => validateField(emailInput));
emailInput.addEventListener('input', () => {
    if (emailInput.classList.contains('error')) validateField(emailInput);
});

passwordInput.addEventListener('input', () => {
    validateField(passwordInput);
    if (confirmPasswordInput.value) validateField(confirmPasswordInput);
});

confirmPasswordInput.addEventListener('blur', () => validateField(confirmPasswordInput));
confirmPasswordInput.addEventListener('input', () => {
    if (confirmPasswordInput.classList.contains('error')) validateField(confirmPasswordInput);
});

// Password visibility toggle
togglePasswordBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    togglePasswordBtn.classList.toggle('showing');
});

toggleConfirmPasswordBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const isPassword = confirmPasswordInput.type === 'password';
    confirmPasswordInput.type = isPassword ? 'text' : 'password';
    toggleConfirmPasswordBtn.classList.toggle('showing');
});

// Form submission
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const isFullnameValid = validateField(fullnameInput);
    const isEmailValid = validateField(emailInput);
    const isPasswordValid = validateField(passwordInput);
    const isConfirmPasswordValid = validateField(confirmPasswordInput);
    
    const termsCheckbox = document.getElementById('terms');
    
    if (!isFullnameValid || !isEmailValid || !isPasswordValid || !isConfirmPasswordValid) {
        showMessage('Please fix the errors above', 'error');
        return;
    }
    
    if (!termsCheckbox.checked) {
        showMessage('Please agree to the Terms & Conditions', 'error');
        return;
    }
    
    // Submit the form
    await submitForm();
});

// ========== FORM SUBMISSION ==========

async function submitForm() {
    const fullname = fullnameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    // Show loading state
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');
    
    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: fullname,
                email: email,
                password: password
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage('Account created successfully! Redirecting...', 'success');
            
            // Store token if provided
            if (data.token) {
                localStorage.setItem('token', data.token);
            }
            
            // Redirect after short delay
            setTimeout(() => {
                window.location.href = '/login';
            }, 1500);
        } else {
            showMessage(data.message || 'Registration failed. Please try again.', 'error');
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
        }
    } catch (error) {
        console.error('Registration error:', error);
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

// Initialize password strength on page load
if (passwordInput.value) {
    updatePasswordStrength(passwordInput.value);
}

// Clear error messages on input focus
[fullnameInput, emailInput, passwordInput, confirmPasswordInput].forEach(input => {
    input.addEventListener('focus', () => {
        messageContainer.textContent = '';
    });
});
