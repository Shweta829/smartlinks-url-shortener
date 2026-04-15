// Analytics Interactive Dashboard

let browserChartInstance = null;
let osChartInstance = null;
let topPerformersChartInstance = null;

const codeInput = document.getElementById('codeInput');
const statsCards = document.getElementById('statsCards');
const chartsContainer = document.getElementById('chartsContainer');
const overviewSection = document.getElementById('overviewSection');
const messageEl = document.getElementById('message');

// ========== LOAD SINGLE URL STATS ==========

async function loadStats() {
    const code = codeInput.value.trim();
    
    if (!code) {
        showMessage('Please enter a short code', 'error');
        return;
    }
    
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login';
        return;
    }
    
    try {
        const response = await fetch(`/api/stats/${code}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            showMessage(data.message || 'URL not found', 'error');
            statsCards.style.display = 'none';
            chartsContainer.style.display = 'none';
            return;
        }
        
        displayStats(data, code);
        showMessage('Analytics loaded successfully!', 'success');
        
    } catch (error) {
        console.error('Error:', error);
        showMessage('Failed to load analytics', 'error');
    }
}

// ========== LOAD ALL URLS STATS ==========

async function loadAllStats() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login';
        return;
    }
    
    try {
        const response = await fetch('/api/history', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            showMessage('Failed to load URLs', 'error');
            return;
        }
        
        displayAllURLsStats(data.urls);
        showMessage('All URLs loaded', 'success');
        
    } catch (error) {
        console.error('Error:', error);
        showMessage('Failed to load all URLs', 'error');
    }
}

// ========== DISPLAY SINGLE STATS ==========

function displayStats(stats, code) {
    // Update stat cards
    document.getElementById('totalClicks').textContent = stats.total_clicks || 0;
    document.getElementById('uniqueBrowsers').textContent = (stats.browser_stats || []).length;
    document.getElementById('uniqueOS').textContent = (stats.os_stats || []).length;
    document.getElementById('shortCodeDisplay').textContent = code;
    
    statsCards.style.display = 'grid';
    chartsContainer.style.display = 'block';
    overviewSection.style.display = 'none';
    
    // Update charts
    const browserLabels = (stats.browser_stats || []).map(x => x[0] || 'Unknown');
    const browserCounts = (stats.browser_stats || []).map(x => x[1] || 0);
    
    const osLabels = (stats.os_stats || []).map(x => x[0] || 'Unknown');
    const osCounts = (stats.os_stats || []).map(x => x[1] || 0);
    
    createBrowserChart(browserLabels, browserCounts);
    createOSChart(osLabels, osCounts);
    createTopPerformersChart(browserLabels, browserCounts, osLabels, osCounts);
}

// ========== DISPLAY ALL URLS STATS ==========

function displayAllURLsStats(urls) {
    if (!urls || urls.length === 0) {
        showMessage('No URLs found', 'error');
        return;
    }
    
    statsCards.style.display = 'none';
    chartsContainer.style.display = 'none';
    overviewSection.style.display = 'block';
    
    // Sort by clicks (descending)
    const sortedUrls = [...urls].sort((a, b) => (b.clicks || 0) - (a.clicks || 0));
    
    const urlsGrid = document.getElementById('urlsGrid');
    urlsGrid.innerHTML = sortedUrls.map((url, index) => `
        <div class="url-card" onclick="loadStatsForUrl('${url.short_code}')">
            <div class="url-rank">#${index + 1}</div>
            <div class="url-info">
                <div class="url-code"><strong>${url.short_code}</strong></div>
                <div class="url-original">${truncateUrl(url.original_url)}</div>
                <div class="url-meta">
                    <span class="badge">📍 ${url.clicks || 0} clicks</span>
                    <span class="badge date">📅 ${new Date(url.created_at).toLocaleDateString()}</span>
                </div>
            </div>
            <div class="url-arrow">→</div>
        </div>
    `).join('');
}

function loadStatsForUrl(code) {
    document.getElementById('codeInput').value = code;
    loadStats();
}

function truncateUrl(url) {
    return url.length > 50 ? url.substring(0, 47) + '...' : url;
}

// ========== CREATE CHARTS ==========

function createBrowserChart(labels, data) {
    const ctx = document.getElementById('browserChart').getContext('2d');
    
    if (browserChartInstance) {
        browserChartInstance.destroy();
    }
    
    browserChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    '#a78bfa',
                    '#60a5fa',
                    '#34d399',
                    '#fbbf24',
                    '#f87171',
                    '#818cf8'
                ],
                borderColor: '#1e293b',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#e0e7ff',
                        font: { size: 12 },
                        padding: 15
                    }
                }
            }
        }
    });
}

function createOSChart(labels, data) {
    const ctx = document.getElementById('osChart').getContext('2d');
    
    if (osChartInstance) {
        osChartInstance.destroy();
    }
    
    osChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Clicks by OS',
                data: data,
                backgroundColor: '#a78bfa',
                borderColor: '#7c3aed',
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    labels: {
                        color: '#e0e7ff'
                    }
                }
            },
            scales: {
                x: {
                    ticks: { color: '#a78bfa' },
                    grid: { color: 'rgba(167, 139, 250, 0.1)' }
                },
                y: {
                    ticks: { color: '#a78bfa' }
                }
            }
        }
    });
}

function createTopPerformersChart(browserLabels, browserCounts, osLabels, osCounts) {
    const ctx = document.getElementById('topPerformersChart').getContext('2d');
    
    if (topPerformersChartInstance) {
        topPerformersChartInstance.destroy();
    }
    
    // Combine all data
    const allLabels = [...browserLabels, ...osLabels];
    const allCounts = [...browserCounts, ...osCounts];
    
    // Sort and get top 8
    const combined = allLabels.map((label, i) => ({ label, count: allCounts[i] }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);
    
    const topLabels = combined.map(x => x.label);
    const topCounts = combined.map(x => x.count);
    
    topPerformersChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: topLabels,
            datasets: [{
                label: 'Clicks',
                data: topCounts,
                backgroundColor: [
                    '#a78bfa',
                    '#c4b5fd',
                    '#ddd6fe',
                    '#ede9fe',
                    '#f3e8ff',
                    '#fae8ff',
                    '#fef3c7',
                    '#fecaca'
                ],
                borderColor: '#7c3aed',
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            indexAxis: 'x',
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    labels: {
                        color: '#e0e7ff'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: '#a78bfa' },
                    grid: { color: 'rgba(167, 139, 250, 0.1)' }
                },
                x: {
                    ticks: { color: '#a78bfa' }
                }
            }
        }
    });
}

// ========== MESSAGE DISPLAY ==========

function showMessage(message, type) {
    messageEl.textContent = message;
    messageEl.className = `message ${type}`;
    messageEl.style.display = 'block';
    
    if (type === 'success') {
        setTimeout(() => {
            messageEl.style.display = 'none';
        }, 3000);
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
});
