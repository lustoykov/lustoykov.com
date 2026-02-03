document.addEventListener('DOMContentLoaded', function () {
    // --- 1. Recovery Metrics Chart (Top of Page) ---
    const ctx = document.getElementById('metricsChart').getContext('2d');

    // Data Configuration
    // --- Source of Truth Data (Jan 16 - Jan 22, 2026) ---
    // In a real app, this would come from an API/Database
    const rawHistory = [
        { date: '2026-01-16', sleep: 64, hrv: 70, rhr: 53 },
        { date: '2026-01-17', sleep: 85, hrv: 69, rhr: 48 },
        { date: '2026-01-18', sleep: 87, hrv: 74, rhr: 47 },
        { date: '2026-01-19', sleep: 84, hrv: 72, rhr: 48 },
        { date: '2026-01-20', sleep: 81, hrv: 66, rhr: 49 },
        { date: '2026-01-21', sleep: 57, hrv: 80, rhr: 49 },
        { date: '2026-01-22', sleep: 78, hrv: 68, rhr: 48 },
        { date: '2026-01-23', sleep: 74, hrv: 68, rhr: 47 },
        { date: '2026-01-24', sleep: 87, hrv: 74, rhr: 46 },
        { date: '2026-01-25', sleep: 80, hrv: 83, rhr: 46 },
        { date: '2026-01-26', sleep: 69, hrv: 73, rhr: 47 },
        { date: '2026-01-27', sleep: 85, hrv: 79, rhr: 46 },
        { date: '2026-01-28', sleep: 68, hrv: 62, rhr: 48 },
        { date: '2026-01-29', sleep: 66, hrv: 64, rhr: 48 },
        { date: '2026-01-30', sleep: 78, hrv: 60, rhr: 51 },
        { date: '2026-01-31', sleep: 78, hrv: 71, rhr: 47 },
        { date: '2026-02-01', sleep: 79, hrv: 71, rhr: 47 },
        { date: '2026-02-02', sleep: 62, hrv: 68, rhr: 50 },
        { date: '2026-02-03', sleep: 82, hrv: 65, rhr: 48 }
    ];

    const today = new Date('2026-02-03T12:00:00'); // Fixed "Today" for demo consistency

    // helper to format dates
    const formatDateKey = (date) => date.toISOString().split('T')[0];
    const formatLabel = (date) => {
        const d = new Date(date);
        return `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;
    };

    // --- Data Generators ---

    function getWeekData() {
        // Last 7 days including today
        const labels = [];
        const sleep = [];
        const hrv = [];
        const rhr = [];

        // simple map since we have exactly 7 days of data matching our view
        // in a robust app we'd look up by date, but here we just align rawHistory
        rawHistory.forEach(day => {
            const d = new Date(day.date);
            labels.push(`${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`);
            sleep.push(day.sleep);
            hrv.push(day.hrv);
            rhr.push(day.rhr);
        });

        return { labels, datasets: { sleep, hrv, rhr } };
    }

    function getMonthData() {
        const labels = [];
        const sleep = [];
        const hrv = [];
        const rhr = [];

        // Generate last 30 days
        for (let i = 29; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const key = formatDateKey(d);

            // Format label e.g., "22 Jan"
            labels.push(`${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`);

            // Find data if exists
            const dayData = rawHistory.find(item => item.date === key);
            if (dayData) {
                sleep.push(dayData.sleep);
                hrv.push(dayData.hrv);
                rhr.push(dayData.rhr);
            } else {
                sleep.push(null);
                hrv.push(null);
                rhr.push(null);
            }
        }
        return { labels, datasets: { sleep, hrv, rhr } };
    }

    function getYearData() {
        const labels = [];
        const sleep = [];
        const hrv = [];
        const rhr = [];

        // Generate last 12 months (e.g. Feb 2025 - Jan 2026)
        // logic: bucket rawHistory by month

        // 1. Bucket data
        const buckets = {}; // "2026-0" -> [items]
        rawHistory.forEach(item => {
            const d = new Date(item.date);
            const key = `${d.getFullYear()}-${d.getMonth()}`;
            if (!buckets[key]) buckets[key] = [];
            buckets[key].push(item);
        });

        // 2. Iterate last 12 months
        for (let i = 11; i >= 0; i--) {
            const d = new Date(today);
            d.setMonth(d.getMonth() - i);
            d.setDate(1); // normalize

            const monthName = d.toLocaleString('default', { month: 'short' });
            labels.push(monthName);

            const key = `${d.getFullYear()}-${d.getMonth()}`;
            const items = buckets[key];

            if (items && items.length > 0) {
                // Calculate averages
                const avgSleep = items.reduce((sum, x) => sum + x.sleep, 0) / items.length;
                const avgHrv = items.reduce((sum, x) => sum + x.hrv, 0) / items.length;
                const avgRhr = items.reduce((sum, x) => sum + x.rhr, 0) / items.length;

                sleep.push(Math.round(avgSleep));
                hrv.push(Math.round(avgHrv));
                rhr.push(Math.round(avgRhr));
            } else {
                sleep.push(null);
                hrv.push(null);
                rhr.push(null);
            }
        }

        return { labels, datasets: { sleep, hrv, rhr } };
    }

    const recoveryData = {
        '1W': getWeekData(),
        '1M': getMonthData(),
        '1Y': getYearData()
    };

    // Gradient for the chart line (Green for Sleep)
    const gradientGreen = ctx.createLinearGradient(0, 0, 0, 400);
    gradientGreen.addColorStop(0, 'rgba(34, 197, 94, 0.5)');
    gradientGreen.addColorStop(1, 'rgba(34, 197, 94, 0.0)');

    let metricsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: recoveryData['1W'].labels,
            datasets: [
                {
                    label: 'Sleep Score',
                    data: recoveryData['1W'].datasets.sleep,
                    borderColor: '#22c55e', // accent-green
                    backgroundColor: gradientGreen,
                    borderWidth: 2,
                    pointBackgroundColor: '#0a0a0a',
                    pointBorderColor: '#22c55e',
                    pointHoverBackgroundColor: '#22c55e',
                    pointHoverBorderColor: '#fff',
                    fill: true,
                    tension: 0.4,
                    spanGaps: true // crucial for connecting lines across nulls if desired, or false to break
                },
                {
                    label: 'HRV',
                    data: recoveryData['1W'].datasets.hrv,
                    borderColor: '#eab308', // accent-yellow
                    borderWidth: 2,
                    borderDash: [5, 5],
                    pointRadius: 0,
                    pointHoverRadius: 4,
                    fill: false,
                    tension: 0.4,
                    spanGaps: true
                },
                {
                    label: 'RHR',
                    data: recoveryData['1W'].datasets.rhr,
                    borderColor: '#3b82f6', // blue
                    borderWidth: 2,
                    borderDash: [5, 5],
                    pointRadius: 0,
                    pointHoverRadius: 4,
                    fill: false,
                    tension: 0.4,
                    spanGaps: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false // We use custom HTML legend
                },
                tooltip: {
                    backgroundColor: '#141414',
                    titleColor: '#ededed',
                    bodyColor: '#a1a1a1',
                    borderColor: '#333',
                    borderWidth: 1,
                    padding: 10,
                    displayColors: true,
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                y: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false },
                    ticks: { color: '#a1a1a1', font: { size: 10 } },
                    suggestedMin: 40,
                    suggestedMax: 100
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#a1a1a1', font: { size: 10 }, maxTicksLimit: 7 }
                }
            },
            interaction: { mode: 'nearest', axis: 'x', intersect: false }
        }
    });

    // Timeframe Switching Logic
    const timeframeBtns = document.querySelectorAll('.timeframe-btn');

    timeframeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active class
            timeframeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const timeframe = btn.getAttribute('data-timeframe');
            const newData = recoveryData[timeframe];

            if (newData) {
                // Update chart data
                metricsChart.data.labels = newData.labels;
                metricsChart.data.datasets[0].data = newData.datasets.sleep;
                metricsChart.data.datasets[1].data = newData.datasets.hrv;
                metricsChart.data.datasets[2].data = newData.datasets.rhr;

                // Adjust X-axis ticks for longer timeframes
                if (timeframe === '1M') {
                    // For month view, maybe show every 5th day label or rely on maxTicksLimit
                    metricsChart.options.scales.x.ticks.maxTicksLimit = 6;
                } else if (timeframe === '1Y') {
                    metricsChart.options.scales.x.ticks.maxTicksLimit = 12;
                } else {
                    metricsChart.options.scales.x.ticks.maxTicksLimit = 7;
                }

                metricsChart.update();
            }
        });
    });

    // --- 2. Trend on Hover Logic (Unchanged) ---
    initTrendOnHover();
});

function initTrendOnHover() {
    const tooltip = document.getElementById('trend-tooltip');
    if (!tooltip) return;

    const ctx = document.getElementById('trendChart').getContext('2d');
    let trendChart = null;

    // 1. Scrape all data from the tables
    // Map: Identifier -> Array of {date, value}
    const biomarkerHistory = {};

    const parseValue = (str) => {
        if (!str) return null;
        const match = str.match(/[0-9]+(\.[0-9]+)?/);
        return match ? parseFloat(match[0]) : null;
    };

    const parseDate = (str) => new Date(str);

    const periods = document.querySelectorAll('.biomarker-period');

    periods.forEach(period => {
        const dateStr = period.querySelector('h4').textContent.trim();
        const rows = period.querySelectorAll('td[data-marker]');

        rows.forEach(td => {
            const markerKey = td.getAttribute('data-marker');
            const valueTd = td.nextElementSibling;
            if (valueTd) {
                const val = parseValue(valueTd.textContent);
                if (val !== null) {
                    if (!biomarkerHistory[markerKey]) {
                        biomarkerHistory[markerKey] = [];
                    }
                    biomarkerHistory[markerKey].push({
                        date: dateStr,
                        value: val,
                        rawDate: parseDate(dateStr)
                    });
                }
            }
        });
    });

    Object.keys(biomarkerHistory).forEach(key => {
        biomarkerHistory[key].sort((a, b) => a.rawDate - b.rawDate);
    });

    // 2. Setup Chart instance
    const gradient = ctx.createLinearGradient(0, 0, 0, 150);
    gradient.addColorStop(0, 'rgba(34, 197, 94, 0.4)');
    gradient.addColorStop(1, 'rgba(34, 197, 94, 0.0)');

    const createChart = (label, dataPoints) => {
        if (trendChart) trendChart.destroy();

        trendChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dataPoints.map(d => formatDate(d.rawDate)),
                datasets: [{
                    label: label,
                    data: dataPoints.map(d => d.value),
                    borderColor: '#22c55e',
                    backgroundColor: gradient,
                    borderWidth: 2,
                    pointBackgroundColor: '#0a0a0a',
                    pointBorderColor: '#22c55e',
                    pointRadius: 4,
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#141414',
                        titleColor: '#fff',
                        bodyColor: '#a1a1a1',
                        padding: 6,
                        displayColors: false,
                        callbacks: {
                            title: () => null
                        }
                    }
                },
                scales: {
                    x: { display: false },
                    y: {
                        display: true,
                        ticks: { color: '#666', font: { size: 9 }, maxTicksLimit: 3 },
                        grid: { color: 'rgba(255,255,255,0.05)' }
                    }
                }
            }
        });
    };

    const formatDate = (date) => {
        const d = new Date(date);
        return `${d.getMonth() + 1}/${d.getFullYear().toString().substr(-2)}`;
    };

    // 3. Attach Event Listeners
    document.querySelectorAll('td[data-marker]').forEach(td => {
        td.addEventListener('mouseenter', (e) => {
            const marker = td.getAttribute('data-marker');
            const history = biomarkerHistory[marker];

            if (history && history.length > 1) {
                createChart(marker, history);
                const rect = td.getBoundingClientRect();
                tooltip.style.left = `${rect.left + window.scrollX + 20}px`;
                tooltip.style.top = `${rect.top + window.scrollY - 160}px`;
                tooltip.style.opacity = '1';
            }
        });

        td.addEventListener('mouseleave', () => {
            tooltip.style.opacity = '0';
        });
    });
}
