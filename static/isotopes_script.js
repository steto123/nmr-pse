/**
 * Isotope Pattern Calculator for Mass Spectrometry
 */

let chartInstance = null;

// Parse chemical formula (e.g., C6H12O6)
function parseFormula(formula) {
    const regex = /([A-Z][a-z]?)(\d*)/g;
    const counts = {};
    let match;

    while ((match = regex.exec(formula)) !== null) {
        const element = match[1];
        const count = parseInt(match[2] || "1");

        if (!CHEMICAL_DATA[element]) {
            throw new Error(`Unbekanntes Element: ${element}`);
        }

        counts[element] = (counts[element] || 0) + count;
    }

    if (Object.keys(counts).length === 0) {
        throw new Error("Ungültige Formel");
    }

    return counts;
}

// Convolve two distributions
// Distribution format: [{m: mass, a: abundance}, ...]
function convolve(distA, distB) {
    const result = {};

    for (const itemA of distA) {
        for (const itemB of distB) {
            const m = itemA.m + itemB.m;
            const a = itemA.a * itemB.a;

            // Round mass to unit resolution (nominal mass)
            const mKey = Math.round(m);
            result[mKey] = (result[mKey] || 0) + a;
        }
    }

    // Convert back to array and prune small peaks
    return Object.entries(result)
        .map(([m, a]) => ({ m: parseFloat(m), a: a }))
        .filter(item => item.a > 1e-10) // Prune peaks with < 1e-8% abundance
        .sort((a, b) => a.m - b.m);
}

// Exponentiate distribution (binary power method)
function distPower(dist, n) {
    let res = [{ m: 0, a: 1 }];
    let base = dist;

    while (n > 0) {
        if (n % 2 === 1) res = convolve(res, base);
        base = convolve(base, base);
        n = Math.floor(n / 2);

        // Safety cap for performance
        if (res.length > 1000) {
            res = res.sort((a, b) => b.a - a.a).slice(0, 1000).sort((a, b) => a.m - b.m);
        }
    }
    return res;
}

function calculatePattern() {
    const input = document.getElementById('formula-input').value.trim();
    const errorDisplay = document.getElementById('error-display');

    errorDisplay.style.display = 'none';

    try {
        const formula = parseFormula(input);
        let combinedDist = [{ m: 0, a: 1 }];

        for (const [element, count] of Object.entries(formula)) {
            const elementDist = CHEMICAL_DATA[element].isotopes;
            combinedDist = convolve(combinedDist, distPower(elementDist, count));
        }

        // Normalize to base peak = 100%
        const maxAbundance = Math.max(...combinedDist.map(d => d.a));
        const finalResults = combinedDist.map(d => ({
            m: d.m,
            a: d.a * 100, // Absolute abundance in %
            rel: (d.a / maxAbundance) * 100 // Relative to base peak
        }));

        displayResults(finalResults);
        updateChart(finalResults);

    } catch (err) {
        errorDisplay.textContent = err.message;
        errorDisplay.style.display = 'block';
    }
}

function displayResults(results) {
    const tbody = document.querySelector('#results-table tbody');
    tbody.innerHTML = '';

    // Sort by mass and take top 20 for table
    const displayItems = results.sort((a, b) => a.m - b.m).slice(0, 50);

    displayItems.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${Math.round(item.m)}</td>
            <td>${item.a.toFixed(4)}%</td>
            <td style="font-weight: bold;">${item.rel.toFixed(2)}%</td>
        `;
        tbody.appendChild(row);
    });
}

function updateChart(results) {
    const ctx = document.getElementById('isotopeChart').getContext('2d');

    const labels = results.map(r => Math.round(r.m));
    const data = results.map(r => r.rel);

    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Rel. Intensität (%)',
                data: data,
                backgroundColor: '#38bdf8',
                borderColor: '#38bdf8',
                borderWidth: 1,
                barThickness: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: { display: true, text: 'm/z', color: '#94a3b8' },
                    grid: { display: false },
                    ticks: { color: '#94a3b8' }
                },
                y: {
                    beginAtZero: true,
                    max: 105,
                    title: { display: true, text: 'Rel. Intensität (%)', color: '#94a3b8' },
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#94a3b8' }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        title: (items) => `m/z: ${Math.round(results[items[0].dataIndex].m)}`,
                        label: (item) => `Intensität: ${item.formattedValue}%`
                    }
                }
            }
        }
    });
}

// Translation Logic
const UI_STRINGS = {
    'de': {
        'title': 'Isotopenmuster-Rechner',
        'iso_desc': 'Geben Sie eine chemische Formel ein (z. B. C6H12O6 oder FeCl3), um das theoretische Isotopenverteilungsmuster für die Massenspektrometrie zu berechnen.',
        'chemical_formula': 'Chemische Formel',
        'calculate': 'Berechnen',
        'mass': 'Masse (m/z)',
        'abundance': 'Häufigkeit (%)',
        'rel_intensity': 'Rel. Intensität (%)'
    },
    'en': {
        'title': 'Isotope Pattern Calculator',
        'iso_desc': 'Enter a chemical formula (e.g., C6H12O6 or FeCl3) to calculate the theoretical isotope distribution pattern for mass spectrometry.',
        'chemical_formula': 'Chemical Formula',
        'calculate': 'Calculate',
        'mass': 'Mass (m/z)',
        'abundance': 'Abundance (%)',
        'rel_intensity': 'Rel. Intensity (%)'
    }
};

let currentLang = 'de';

function updateTranslations() {
    const strings = UI_STRINGS[currentLang];
    document.querySelector('h1').textContent = strings.title;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (strings[key]) el.textContent = strings[key];
    });
    // Re-calculate to update chart labels (m/z) if needed, 
    // though chart currently uses numerical labels.
    calculatePattern();
}

function setupLangSwitcher() {
    const btns = document.querySelectorAll('.lang-btn');
    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            btns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentLang = btn.dataset.lang;
            updateTranslations();
        });
    });
}

// Initial calculation
document.getElementById('calculate-btn').addEventListener('click', calculatePattern);
document.getElementById('formula-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') calculatePattern();
});

// Run initial
window.addEventListener('load', () => {
    calculatePattern();
    setupLangSwitcher();
});
