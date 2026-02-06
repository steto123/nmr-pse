let elementsData = [];
let translations = {};
let currentLang = 'de';

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

async function initApp() {
    try {
        const response = await fetch('/api/data');
        const data = await response.json();
        elementsData = data.elements;
        translations = data.translations;

        const countDisplay = document.getElementById('element-count');
        countDisplay.textContent = elementsData.length;

        renderApp(elementsData);
        setupSearch();
        setupLanguageSwitcher();
        updateUI();

    } catch (error) {
        console.error('Error initializing app:', error);
    }
}

function t(text) {
    if (currentLang === 'de') return text;
    return translations[text] || text;
}

function updateUI() {
    // Update static translations
    const uiStrings = {
        'de': {
            'search_placeholder': 'Element suchen (Name oder Symbol)...',
            'elements_loaded': 'Elemente geladen',
            'nmr_active_isotopes': 'NMR Aktive Isotope',
            'title': 'Periodensystem der Elemente',
            'tools': 'Tools',
            'isotope_pattern': 'Isotopenmuster',
            'molar_mass': 'Molmassenrechner'
        },
        'en': {
            'search_placeholder': 'Search element (Name or Symbol)...',
            'elements_loaded': 'Elements loaded',
            'nmr_active_isotopes': 'NMR Active Isotopes',
            'title': 'Periodic Table of Elements',
            'tools': 'Tools',
            'isotope_pattern': 'Isotope Pattern',
            'molar_mass': 'Molar Mass Calculator'
        }
    };

    const strings = uiStrings[currentLang];

    document.querySelector('h1').textContent = strings.title;
    document.getElementById('element-search').placeholder = strings.search_placeholder;
    document.querySelector('[data-i18n="elements_loaded"]').textContent = strings.elements_loaded;
    document.querySelector('[data-i18n="tools"]').textContent = strings.tools;
    document.querySelector('[data-i18n="isotope_pattern"]').textContent = strings.isotope_pattern;

    // Re-render the grid to update element names
    renderApp(elementsData);
}

function setupLanguageSwitcher() {
    const btns = document.querySelectorAll('.lang-btn');
    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            btns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentLang = btn.dataset.lang;
            updateUI();
        });
    });
}

function renderApp(elements) {
    const grid = document.getElementById('ptable-grid');
    grid.innerHTML = '';

    // 1. Render Group Headers (1-18)
    for (let g = 1; g <= 18; g++) {
        const h = document.createElement('div');
        h.className = 'grid-label group-label';
        h.style.gridRow = 1;
        h.style.gridColumn = g;
        h.textContent = g;
        grid.appendChild(h);
    }

    // 2. Render elements
    elements.forEach(el => {
        const card = document.createElement('div');
        card.className = 'element-card';
        card.dataset.number = el.Atomnummer;

        // Logical Grid Position
        let row = el.Periode + 1; // +1 for headers
        let col = el.Gruppe;

        if (el.Typ === 'Lanthanide') {
            row = 10;
            col = (el.Atomnummer - 57) + 3;
        } else if (el.Typ === 'Actinide') {
            row = 11;
            col = (el.Atomnummer - 89) + 3;
        }

        card.style.gridRow = row;
        card.style.gridColumn = col;

        // Colors
        if (el.Metall) card.classList.add('type-metall');
        if (el.Nichtmetall) card.classList.add('type-nichtmetall');
        if (el.Halbmetall) card.classList.add('type-halbmetall');

        const elementName = currentLang === 'de' ? el.Element : t(el.Element);

        card.innerHTML = `
            <div class="atomic-num">${el.Atomnummer}</div>
            <div class="symbol">${el.Symbol}</div>
            <div class="name">${elementName}</div>
            ${el.NMR_Daten ? '<div class="isotope-badge">NMR</div>' : ''}
        `;

        card.addEventListener('click', () => showDetails(el.Atomnummer));
        grid.appendChild(card);
    });
}

function showDetails(atomicNumber) {
    const el = elementsData.find(e => e.Atomnummer === atomicNumber);
    if (!el) return;

    const panel = document.getElementById('details-panel');
    const propertyContainer = document.getElementById('properties-grid');

    document.getElementById('detail-atomnummer').textContent = el.Atomnummer;
    document.getElementById('detail-symbol').textContent = el.Symbol;
    document.getElementById('detail-name').textContent = currentLang === 'de' ? el.Element : t(el.Element);

    propertyContainer.innerHTML = '';

    // 1. Main Properties
    const skipKeys = ['Atomnummer', 'Symbol', 'Element', 'Metall', 'Nichtmetall', 'Halbmetall', 'Typ', 'NMR_Daten'];

    Object.entries(el).forEach(([key, value]) => {
        if (skipKeys.includes(key) || value === null) return;

        const item = document.createElement('div');
        item.className = 'property-item';
        const translatedKey = t(key);
        const translatedValue = (typeof value === 'string') ? t(value) : value;

        item.innerHTML = `
            <div class="property-label">${translatedKey}</div>
            <div class="property-value">${translatedValue}</div>
        `;
        propertyContainer.appendChild(item);
    });

    // 2. NMR Section
    if (el.NMR_Daten && el.NMR_Daten.length > 0) {
        const nmrSection = document.createElement('div');
        nmrSection.className = 'nmr-section';
        nmrSection.innerHTML = `<h3>${currentLang === 'de' ? 'NMR Aktive Isotope' : 'NMR Active Isotopes'}</h3>`;

        const nmrGrid = document.createElement('div');
        nmrGrid.className = 'nmr-grid';

        el.NMR_Daten.forEach(iso => {
            const isoCard = document.createElement('div');
            isoCard.className = 'nmr-isotope-card';

            let propsHtml = '';
            Object.entries(iso).forEach(([k, v]) => {
                if (k === 'Isotop' || v === null) return;
                propsHtml += `
                    <div class="property-item">
                        <div class="property-label">${t(k)}</div>
                        <div class="property-value">${(typeof v === 'string') ? t(v) : v}</div>
                    </div>
                `;
            });

            isoCard.innerHTML = `
                <div class="nmr-isotope-header">${t('Isotop')}: <sup>${iso.Isotop}</sup>${el.Symbol}</div>
                <div class="nmr-props">
                    ${propsHtml}
                </div>
            `;
            nmrGrid.appendChild(isoCard);
        });

        nmrSection.appendChild(nmrGrid);
        propertyContainer.appendChild(nmrSection);
    }

    panel.classList.remove('hidden');
}

document.getElementById('close-details').addEventListener('click', () => {
    document.getElementById('details-panel').classList.add('hidden');
});

function setupSearch() {
    const search = document.getElementById('element-search');
    search.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase().trim();
        const cards = document.querySelectorAll('.element-card');

        if (!term) {
            cards.forEach(c => c.classList.remove('search-highlight', 'dimmed'));
            return;
        }

        cards.forEach(card => {
            const num = card.querySelector('.atomic-num').textContent;
            const sym = card.querySelector('.symbol').textContent.toLowerCase();
            const name = card.querySelector('.name').textContent.toLowerCase();

            if (num.includes(term) || sym.includes(term) || name.includes(term)) {
                card.classList.add('search-highlight');
                card.classList.remove('dimmed');
            } else {
                card.classList.remove('search-highlight');
                card.classList.add('dimmed');
            }
        });
    });
}
