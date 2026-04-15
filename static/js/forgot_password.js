// Forgot Password Form Logic

const forgotForm = document.getElementById('forgotForm');
const emailInput = document.getElementById('email');
const newPasswordInput = document.getElementById('new-password');
const confirmNewPasswordInput = document.getElementById('confirm-new-password');
const submitBtn = document.getElementById('submitBtn');
const resetPasswordBtn = document.getElementById('resetPasswordBtn');
const formMessage = document.getElementById('formMessage');
const formMessage2 = document.getElementById('formMessage2');
const step1 = document.getElementById('step1');
const step2 = document.getElementById('step2');

let resetToken = null;

// ========== VALIDATION RULES ==========

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

// Email validation
emailInput.addEventListener('blur', () => validateField(emailInput, validateEmail));
emailInput.addEventListener('input', () => {
    if (emailInput.classList.contains('error')) {
        validateField(emailInput, validateEmail);
    }
});

// Password validation
newPasswordInput.addEventListener('input', () => {
    const strength = checkPasswordStrength(newPasswordInput.value);
    const strengthBar = document.getElementById('strengthBar');
    const strengthLabel = document.getElementById('strengthLabel');
    
    strengthBar.className = 'strength-bar ' + strength;
    strengthLabel.textContent = 'Strength: ' + strength.charAt(0).toUpperCase() + strength.slice(1);
    
    if (newPasswordInput.classList.contains('error')) {
        validateField(newPasswordInput, validatePassword);
    }
    
    if (confirmNewPasswordInput.value) {
        validateField(confirmNewPasswordInput, (val) => validateConfirmPassword(newPasswordInput.value, val));
    }
});

newPasswordInput.addEventListener('blur', () => validateField(newPasswordInput, validatePassword));

// Confirm password validation
confirmNewPasswordInput.addEventListener('blur', () => {
    validateField(confirmNewPasswordInput, (val) => validateConfirmPassword(newPasswordInput.value, val));
});

confirmNewPasswordInput.addEventListener('input', () => {
    if (confirmNewPasswordInput.classList.contains('error')) {
        validateField(confirmNewPasswordInput, (val) => validateConfirmPassword(newPasswordInput.value, val));
    }
});

// Password visibility toggle
document.getElementById('togglePassword').addEventListener('click', (e) => {
    e.preventDefault();
    const isPassword = newPasswordInput.type === 'password';
    newPasswordInput.type = isPassword ? 'text' : 'password';
});

document.getElementById('toggleConfirmPassword').addEventListener('click', (e) => {
    e.preventDefault();
    const isPassword = confirmNewPasswordInput.type === 'password';
    confirmNewPasswordInput.type = isPassword ? 'text' : 'password';
});

// Form submission - Step 1 (email input)
forgotForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const isEmailValid = validateField(emailInput, validateEmail);
    
    if (!isEmailValid) {
        showMessage('Please enter a valid email', 'error', formMessage);
        return;
    }
    
    await sendResetLink();
});

// Step 2 - Reset password
resetPasswordBtn.addEventListener('click', async () => {
    const isPasswordValid = validateField(newPasswordInput, validatePassword);
    const isConfirmValid = validateField(confirmNewPasswordInput, (val) => validateConfirmPassword(newPasswordInput.value, val));
    
    if (!isPasswordValid || !isConfirmValid) {
        showMessage('Please fix the errors above', 'error', formMessage2);
        return;
    }
    
    await submitNewPassword();
});

// ========== SEND RESET LINK ==========

async function sendResetLink() {
    const email = emailInput.value.trim();
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    
    try {
        const response = await fetch('/api/forgot-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            resetToken = data.reset_token || 'token-' + Date.now();
            showMessage('Reset link sent! Proceed to reset your password.', 'success', formMessage);
            
            // Show step 2 after 2 seconds
            setTimeout(() => {
                step1.style.display = 'none';
                step2.style.display = 'block';
            }, 2000);
        } else {
            showMessage(data.message || 'Failed to send reset link', 'error', formMessage);
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send Reset Link';
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('Network error. Please try again.', 'error', formMessage);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Reset Link';
    }
}

// ========== SUBMIT NEW PASSWORD ==========

async function submitNewPassword() {
    const email = emailInput.value.trim();
    const newPassword = newPasswordInput.value;
    
    resetPasswordBtn.disabled = true;
    resetPasswordBtn.textContent = 'Updating...';
    
    try {
        const response = await fetch('/api/reset-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                new_password: newPassword,
                reset_token: resetToken
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage('Password updated successfully! Redirecting to login...', 'success', formMessage2);
            setTimeout(() => {
                window.location.href = '/login';
            }, 2000);
        } else {
            showMessage(data.message || 'Failed to update password', 'error', formMessage2);
            resetPasswordBtn.disabled = false;
            resetPasswordBtn.textContent = 'Update Password';
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('Network error. Please try again.', 'error', formMessage2);
        resetPasswordBtn.disabled = false;
        resetPasswordBtn.textContent = 'Update Password';
    }
}

// ========== MESSAGE DISPLAY ==========

function showMessage(message, type, container) {
    container.textContent = message;
    container.className = 'form-message ' + type;
    
    if (type === 'error') {
        setTimeout(() => container.classList.remove('error'), 5000);
    }
}
