// Dashboard Interactive Features

const form = document.getElementById('shortenForm');
const urlInput = document.getElementById('urlInput');
const shortenBtn = document.getElementById('shortenBtn');
const formMessage = document.getElementById('formMessage');
const shortUrlSection = document.getElementById('shortUrlSection');
const historySection = document.getElementById('historySection');

// ========== URL VALIDATION ==========

function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (e) {
        return false;
    }
}



// ========== REAL-TIME VALIDATION ==========

urlInput.addEventListener('blur', () => validateUrlField());
urlInput.addEventListener('input', () => {
    if (urlInput.classList.contains('error')) validateUrlField();
});

function validateUrlField() {
    const value = urlInput.value.trim();
    const errorEl = document.getElementById('urlError');
    const iconEl = document.getElementById('urlIcon');
    
    if (!value) {
        urlInput.classList.remove('valid');
        urlInput.classList.add('error');
        errorEl.textContent = 'URL is required';
        iconEl.textContent = '';
        return false;
    }
    
    if (!isValidUrl(value)) {
        urlInput.classList.remove('valid');
        urlInput.classList.add('error');
        errorEl.textContent = 'Invalid URL format';
        iconEl.textContent = '';
        return false;
    }
    
    urlInput.classList.remove('error');
    urlInput.classList.add('valid');
    errorEl.textContent = '';
    iconEl.textContent = '✓';
    return true;
}



// ========== FORM SUBMISSION ==========

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!validateUrlField()) {
        showMessage('Please enter a valid URL', 'error');
        return;
    }
    
    await shortenUrl();
});

// ========== SHORTEN URL ==========

async function shortenUrl() {
    const url = urlInput.value.trim();
    const token = localStorage.getItem('token');
    
    if (!token) {
        window.location.href = '/login';
        return;
    }
    
    shortenBtn.disabled = true;
    shortenBtn.classList.add('loading');
    
    try {
        const response = await fetch('/api/shorten', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                url: url
            })
        });
        
        const data = await response.json();
        
        if (response.ok && data.short_url) {
            showMessage('URL shortened successfully!', 'success');
            displayResult(data);
            urlInput.value = '';
            urlInput.classList.remove('valid', 'error');
            loadHistory();
        } else {
            showMessage(data.message || 'Failed to shorten URL', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('Network error. Please try again.', 'error');
    } finally {
        shortenBtn.disabled = false;
        shortenBtn.classList.remove('loading');
    }
}

// ========== DISPLAY RESULT ==========

function displayResult(data) {
    document.getElementById('shortUrl').value = data.short_url;
    shortUrlSection.style.display = 'block';
}

// ========== COPY TO CLIPBOARD ==========

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('copy-btn') || e.target.classList.contains('copy-icon')) {
        const shortUrl = document.getElementById('shortUrl').value;
        navigator.clipboard.writeText(shortUrl).then(() => {
            showMessage('Copied to clipboard!', 'success');
        }).catch(() => {
            showMessage('Failed to copy', 'error');
        });
    }
});

// ========== LOAD HISTORY ==========

async function loadHistory() {
    const token = localStorage.getItem('token');
    
    if (!token) return;
    
    try {
        const response = await fetch('/api/history', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        
        if (data.urls && data.urls.length > 0) {
            historySection.style.display = 'block';
            const historyList = document.getElementById('historyList');
            historyList.innerHTML = data.urls.map(url => `
                <div class="history-item">
                    <div class="history-url">
                        <a href="http://127.0.0.1:5000/${url.short_code}" target="_blank">http://127.0.0.1:5000/${url.short_code}</a>
                    </div>
                    <div class="history-original">
                        <small>${url.original_url}</small>
                    </div>
                    <div class="history-stats">
                        <span class="history-clicks">📊 ${url.clicks || 0} clicks</span>
                        <span class="history-date">${new Date(url.created_at).toLocaleDateString()}</span>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading history:', error);
    }
}

// ========== MESSAGE DISPLAY ==========

function showMessage(message, type) {
    formMessage.textContent = message;
    formMessage.className = `form-message ${type}`;
    formMessage.style.display = 'block';
    
    if (type === 'error') {
        setTimeout(() => {
            formMessage.style.display = 'none';
        }, 5000);
    }
}

// ========== USER INFO ==========

function loadUserInfo() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login';
        return;
    }
    
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
        try {
            const user = JSON.parse(userInfo);
            document.getElementById('userInfo').textContent = `👤 ${user.username}`;
        } catch (e) {
            console.error('Error parsing user info:', e);
        }
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    window.location.href = '/login';
}

// ========== INIT ==========

window.addEventListener('load', () => {
    loadUserInfo();
    loadHistory();
});