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

// ========== TOTAL CLICKS ANALYSIS ==========

let totalBrowserChartInstance = null;
let totalOsChartInstance = null;
let clicksDistributionChartInstance = null;
let clicksPerUrlChartInstance = null;

function makeSummaryCardsInteractive(urls, totalClicks, activeUrls) {
    const summaryCards = document.querySelectorAll('.summary-card');
    
    summaryCards.forEach((card, index) => {
        card.style.cursor = 'pointer';
        card.style.transition = 'all 0.3s ease';
        
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px)';
            card.style.boxShadow = '0 10px 30px rgba(167, 139, 250, 0.3)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = 'none';
        });
        
        card.addEventListener('click', () => {
            if (index === 0) {
                showMessage(`📊 Total Clicks: ${totalClicks}`, 'success');
            } else if (index === 1) {
                showMessage(`🔗 Active URLs: ${activeUrls}`, 'success');
            } else if (index === 2) {
                const avgClicks = activeUrls > 0 ? (totalClicks / activeUrls).toFixed(2) : 0;
                showMessage(`⭐ Average Clicks per URL: ${avgClicks}`, 'success');
            } else if (index === 3) {
                const topUrl = urls.reduce((max, url) => (url.clicks || 0) > (max.clicks || 0) ? url : max);
                showMessage(`🏆 Top URL: ${topUrl.short_code} (${topUrl.clicks} clicks)`, 'success');
            }
        });
    });
}

function analyzeTotalClicks() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login';
        return;
    }
    
    try {
        const response = fetch('/api/history', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        response.then(res => res.json()).then(data => {
            if (data.urls && data.urls.length > 0) {
                displayTotalClicksAnalysis(data.urls);
                showMessage('Total clicks analysis loaded!', 'success');
            }
        }).catch(error => {
            console.error('Error:', error);
            showMessage('Failed to load total clicks analysis', 'error');
        });
        
    } catch (error) {
        console.error('Error:', error);
        showMessage('Failed to analyze total clicks', 'error');
    }
}

function displayTotalClicksAnalysis(urls) {
    statsCards.style.display = 'none';
    chartsContainer.style.display = 'none';
    overviewSection.style.display = 'none';
    document.getElementById('totalClicksSection').style.display = 'block';
    
    // Calculate statistics
    const totalClicks = urls.reduce((sum, url) => sum + (url.clicks || 0), 0);
    const activeUrls = urls.length;
    const avgClicks = activeUrls > 0 ? Math.round(totalClicks / activeUrls * 100) / 100 : 0;
    const topUrl = urls.length > 0 ? urls.reduce((max, url) => (url.clicks || 0) > (max.clicks || 0) ? url : max) : null;
    
    // Update summary cards
    document.getElementById('summaryTotalClicks').textContent = totalClicks;
    document.getElementById('summaryActiveUrls').textContent = activeUrls;
    document.getElementById('summaryAvgClicks').textContent = avgClicks;
    document.getElementById('summaryTopUrl').textContent = topUrl ? topUrl.short_code : '-';
    
    // Make summary cards interactive
    makeSummaryCardsInteractive(urls, totalClicks, activeUrls);
    
    // Fetch detailed stats for each URL to get browser/OS data
    fetchAggregatedBrowserOsData(urls);
    
    // Create charts
    const urlCodes = urls.map(u => u.short_code);
    const clicksData = urls.map(u => u.clicks || 0);
    
    createClicksDistributionChart(urlCodes, clicksData, urls);
    createClicksPerUrlChart(urlCodes, clicksData);
}

async function fetchAggregatedBrowserOsData(urls) {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    // Aggregate browser and OS data across all URLs
    const browserData = {};
    const osData = {};
    
    try {
        for (const url of urls) {
            try {
                const response = await fetch(`/api/stats/${url.short_code}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    
                    // Aggregate browser stats
                    if (data.browser_stats) {
                        data.browser_stats.forEach(([browser, count]) => {
                            browserData[browser] = (browserData[browser] || 0) + count;
                        });
                    }
                    
                    // Aggregate OS stats
                    if (data.os_stats) {
                        data.os_stats.forEach(([os, count]) => {
                            osData[os] = (osData[os] || 0) + count;
                        });
                    }
                }
            } catch (e) {
                console.error(`Error fetching stats for ${url.short_code}:`, e);
            }
        }
        
        // Convert to arrays and sort by count descending
        const browserLabels = Object.keys(browserData).sort((a, b) => browserData[b] - browserData[a]);
        const browserCounts = browserLabels.map(label => browserData[label]);
        
        const osLabels = Object.keys(osData).sort((a, b) => osData[b] - osData[a]);
        const osCounts = osLabels.map(label => osData[label]);
        
        // Create charts
        if (browserLabels.length > 0) {
            createTotalBrowserChart(browserLabels, browserCounts);
        }
        if (osLabels.length > 0) {
            createTotalOsChart(osLabels, osCounts);
        }
        
    } catch (error) {
        console.error('Error aggregating browser/OS data:', error);
    }
}

function createClicksDistributionChart(labels, data, urls) {
    const ctx = document.getElementById('clicksDistributionChart').getContext('2d');
    
    if (clicksDistributionChartInstance) {
        clicksDistributionChartInstance.destroy();
    }
    
    clicksDistributionChartInstance = new Chart(ctx, {
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
                    '#818cf8',
                    '#fb923c',
                    '#f472b6',
                    '#06b6d4',
                    '#10b981'
                ],
                borderColor: '#1e293b',
                borderWidth: 2,
                hoverBorderWidth: 4,
                hoverOffset: 8
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
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    titleColor: '#fbbf24',
                    bodyColor: '#c7d2fe',
                    borderColor: '#a78bfa',
                    borderWidth: 2,
                    padding: 12,
                    titleFont: { size: 14, weight: 'bold' },
                    bodyFont: { size: 12 },
                    cornerRadius: 8,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${value} clicks (${percentage}%)`;
                        }
                    }
                }
            },
            onClick: (event, elements) => {
                if (elements.length > 0) {
                    const index = elements[0].index;
                    if (urls && urls[index]) {
                        showMessage(`Selected: ${urls[index].short_code} - ${urls[index].clicks} clicks`, 'success');
                    }
                }
            }
        }
    });
}

// ========== TOTAL BROWSER CHART (PIE) ==========

function createTotalBrowserChart(labels, data) {
    const ctx = document.getElementById('totalBrowserChart').getContext('2d');
    
    if (totalBrowserChartInstance) {
        totalBrowserChartInstance.destroy();
    }
    
    totalBrowserChartInstance = new Chart(ctx, {
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
                    '#818cf8',
                    '#fb923c',
                    '#f472b6',
                    '#06b6d4',
                    '#10b981'
                ],
                borderColor: '#1e293b',
                borderWidth: 2,
                hoverBorderWidth: 4,
                hoverOffset: 8
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
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    titleColor: '#fbbf24',
                    bodyColor: '#c7d2fe',
                    borderColor: '#a78bfa',
                    borderWidth: 2,
                    padding: 12,
                    titleFont: { size: 14, weight: 'bold' },
                    bodyFont: { size: 12 },
                    cornerRadius: 8,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${value} clicks (${percentage}%)`;
                        }
                    }
                }
            },
            onClick: (event, elements) => {
                if (elements.length > 0) {
                    const index = elements[0].index;
                    if (labels && labels[index]) {
                        showMessage(`Selected: ${labels[index]} - ${data[index]} clicks`, 'success');
                    }
                }
            }
        }
    });
}

// ========== TOTAL OS CHART (BAR) ==========

function createTotalOsChart(labels, data) {
    const ctx = document.getElementById('totalOsChart').getContext('2d');
    
    if (totalOsChartInstance) {
        totalOsChartInstance.destroy();
    }
    
    totalOsChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Clicks by OS',
                data: data,
                backgroundColor: [
                    '#a78bfa',
                    '#60a5fa',
                    '#34d399',
                    '#fbbf24',
                    '#f87171',
                    '#818cf8'
                ],
                borderColor: '#7c3aed',
                borderWidth: 2,
                borderRadius: 8,
                hoverBackgroundColor: '#c4b5fd',
                hoverBorderWidth: 4
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
                },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    titleColor: '#fbbf24',
                    bodyColor: '#c7d2fe',
                    borderColor: '#a78bfa',
                    borderWidth: 2,
                    padding: 12,
                    titleFont: { size: 14, weight: 'bold' },
                    bodyFont: { size: 12 },
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed.x / total) * 100).toFixed(1);
                            return `Clicks: ${context.parsed.x} (${percentage}%)`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: { color: '#a78bfa' },
                    grid: { color: 'rgba(167, 139, 250, 0.1)' }
                },
                y: {
                    ticks: { color: '#a78bfa' }
                }
            },
            onClick: (event, elements) => {
                if (elements.length > 0) {
                    const index = elements[0].index;
                    if (labels && labels[index]) {
                        showMessage(`Selected OS: ${labels[index]} - ${data[index]} clicks`, 'success');
                    }
                }
            }
        }
    });
}

function createClicksPerUrlChart(labels, data) {
    const ctx = document.getElementById('clicksPerUrlChart').getContext('2d');
    
    if (clicksPerUrlChartInstance) {
        clicksPerUrlChartInstance.destroy();
    }
    
    clicksPerUrlChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Clicks',
                data: data,
                backgroundColor: [
                    '#a78bfa',
                    '#60a5fa',
                    '#34d399',
                    '#fbbf24',
                    '#f87171',
                    '#818cf8',
                    '#fb923c',
                    '#f472b6'
                ],
                borderColor: '#7c3aed',
                borderWidth: 2,
                borderRadius: 8,
                hoverBackgroundColor: '#c4b5fd',
                hoverBorderWidth: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            indexAxis: 'x',
            plugins: {
                legend: {
                    labels: {
                        color: '#e0e7ff'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    titleColor: '#fbbf24',
                    bodyColor: '#c7d2fe',
                    borderColor: '#a78bfa',
                    borderWidth: 2,
                    padding: 12,
                    titleFont: { size: 14, weight: 'bold' },
                    bodyFont: { size: 12 },
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed.y / total) * 100).toFixed(1);
                            return `Clicks: ${context.parsed.y} (${percentage}%)`;
                        }
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
                    ticks: { color: '#a78bfa' },
                    grid: { color: 'rgba(167, 139, 250, 0.1)' }
                }
            },
            onClick: (event, elements) => {
                if (elements.length > 0) {
                    const index = elements[0].index;
                    if (labels && labels[index]) {
                        showMessage(`Selected URL: ${labels[index]} - ${data[index]} clicks`, 'success');
                    }
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
