# Interaktives Periodensystem & NMR-Isotopendaten
# Interactive Periodic Table & NMR Isotope Data

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🇩🇪 Deutsch

### Projektbeschreibung
Dieses Projekt ist ein modernes, interaktives Periodensystem der Elemente (PSE), das speziell für Chemiker und Wissenschaftler entwickelt wurde. Neben den Standard-Informationen wie Atommasse und Elektronegativität liegt der Fokus auf **NMR-Isotopendaten** sowie nützlichen **Chemie-Tools**.

Die Anwendung lädt ihre Basisdaten dynamisch aus einer Excel-Datei (`daten/PTE-deutsch.xlsx`), was eine einfache Wartung und Aktualisierung ermöglicht.

### Hauptmerkmale
- **Erweiterte Elementdaten**: Umfassende Anzeige zahlreicher physikalischer, thermischer, atomarer/struktureller sowie ökonomischer Eigenschaften.
- **Intelligente Daten-Gruppierung**: Übersichtliche Darstellung der umfangreichen Element-Eigenschaften im Detail-Panel durch logische Gruppierung (z. B. Allgemein, Struktur, Ökonomie).
- **NMR-Isotopen-Integration**: Anzeige von Kernspin, natürlicher Häufigkeit, Magnetogyrischem Verhältnis und Quadrupolmoment.
- **Isotopenmuster-Rechner**: Grafische und tabellarische Darstellung von Isotopenverteilungen in der Massenspektrometrie (Unit Resolution).
- **Molmassenrechner**: Berechnung von Durchschnittsmasse, exakter Masse und Nominalmasse inkl. Elementarzusammensetzung.
- **Zweisprachig**: Vollständige Unterstützung für Deutsch und Englisch (DE/EN Switch) in allen Modulen.
- **Interaktive Suche**: Schnelles Finden von Elementen nach Name oder Symbol.
- **Modernes UI**: Dunkles Design mit Glasmorphismus-Effekten, flüssigen Animationen, optimierter Menüführung und übersichtlichem Grid-Layout.

### Technische Architektur
- **Backend**: Flask (Python) – API für Elementdaten und Excel-Import via Pandas.
- **Frontend**: Vanilla JavaScript, HTML5, CSS3 und **Chart.js** für grafische Auswertungen.
- **Datenquelle**: Microsoft Excel (`.xlsx`) für das PSE; integrierte Isotopen-Datenbank für die Tools.

---

## 🇺🇸 English

### Project Description
This project is a modern, interactive Periodic Table of Elements (PTE) specifically designed for chemists and researchers. In addition to standard information such as atomic mass and electronegativity, the primary focus is on **NMR isotope data** and integrated **chemistry tools**.

The application dynamically loads its core data from an Excel file (`daten/PTE-deutsch.xlsx`), allowing for easy maintenance and updates.

### Key Features
- **Extended Element Data**: Comprehensive overview of physical, thermal, atomic/structural, and economic properties.
- **Smart Data Grouping**: Clear and organized presentation of extensive element properties through logical grouping in the details panel (e.g., General, Structure, Economy).
- **NMR Isotope Integration**: Displays nuclear spin, natural abundance, gyromagnetic ratio, and quadrupole moment.
- **Isotope Pattern Calculator**: Graphical and tabular representation of isotope distributions for mass spectrometry (unit resolution).
- **Molar Mass Calculator**: Calculates average molar mass, exact mass, and nominal mass, including elemental composition.
- **Bilingual**: Full support for German and English (DE/EN toggle) across all modules.
- **Interactive Search**: Quickly find elements by name or symbol.
- **Modern UI**: Dark-themed interface with glassmorphism effects, smooth transitions, optimized navigation, and organized grid layouts.

### Technical Stack
- **Backend**: Flask (Python) – Acts as an API for element data and handles Excel import via Pandas.
- **Frontend**: Vanilla JavaScript, HTML5, CSS3, and **Chart.js** for graphical visualizations.
- **Data Source**: Microsoft Excel (`.xlsx`) for the PTE; built-in isotope database for tools.

---

## 🚀 Installation & Start

1. **Repository klonen / Clone repository**:
   ```bash
   git clone <repository-url>
   cd pse-neu
   ```

2. **Abhängigkeiten installieren / Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Anwendung starten / Start application**:
   ```bash
   python app.py
   ```
   Die App ist dann unter `http://localhost:5000` erreichbar.

---

## 📄 Lizenz / License
Dieses Projekt steht unter der MIT-Lizenz.
This project is licensed under the MIT License.
