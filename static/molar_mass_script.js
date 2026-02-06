/**
 * Molar Mass Calculator Logic
 */

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

function calculateMolarMass() {
    const input = document.getElementById('formula-input').value.trim();
    const errorDisplay = document.getElementById('error-display');
    const resultsDisplay = document.getElementById('results-display');
    const compTable = document.querySelector('#comp-table tbody');

    errorDisplay.style.display = 'none';

    try {
        const formula = parseFormula(input);

        let totalAvg = 0;
        let totalExact = 0;
        let totalNominal = 0;

        const composition = [];

        for (const [element, count] of Object.entries(formula)) {
            const data = CHEMICAL_DATA[element];

            // Average mass
            const avg = data.avg * count;
            totalAvg += avg;

            // Exact mass (of the most abundant isotope)
            const mostAbundant = data.isotopes.sort((a, b) => b.a - a.a)[0];
            totalExact += mostAbundant.m * count;

            // Nominal mass (integer part of the most abundant isotope's mass)
            totalNominal += Math.round(mostAbundant.m) * count;

            composition.push({
                symbol: element,
                count: count,
                massContribution: avg
            });
        }

        // Update UI
        document.getElementById('val-avg').textContent = totalAvg.toFixed(4);
        document.getElementById('val-exact').textContent = totalExact.toFixed(4);
        document.getElementById('val-nominal').textContent = totalNominal;

        // Composition Table
        compTable.innerHTML = '';
        composition.forEach(item => {
            const percentage = (item.massContribution / totalAvg) * 100;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td style="font-weight: bold; color: var(--accent-color);">${item.symbol}</td>
                <td>${item.count}</td>
                <td>${percentage.toFixed(2)} %</td>
            `;
            compTable.appendChild(row);
        });

    } catch (err) {
        errorDisplay.textContent = err.message;
        errorDisplay.style.display = 'block';
    }
}

// Translation Logic
const UI_STRINGS = {
    'de': {
        'title': 'Molmassenrechner',
        'chemical_formula': 'Chemische Formel',
        'calculate': 'Berechnen',
        'molar_mass_avg': 'Molmasse (Durchschnitt)',
        'exact_mass': 'Exakte Masse',
        'nominal_mass': 'Nominalmasse',
        'element': 'Element',
        'amount': 'Anzahl',
        'percentage': 'Anteil (Masse-%)'
    },
    'en': {
        'title': 'Molar Mass Calculator',
        'chemical_formula': 'Chemical Formula',
        'calculate': 'Calculate',
        'molar_mass_avg': 'Molar Mass (Average)',
        'exact_mass': 'Exact Mass',
        'nominal_mass': 'Nominal Mass',
        'element': 'Element',
        'amount': 'Amount',
        'percentage': 'Percentage (Mass-%)'
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

// Event Listeners
document.getElementById('calc-btn').addEventListener('click', calculateMolarMass);
document.getElementById('formula-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') calculateMolarMass();
});

// Initial calculate
window.addEventListener('load', () => {
    calculateMolarMass();
    setupLangSwitcher();
});
