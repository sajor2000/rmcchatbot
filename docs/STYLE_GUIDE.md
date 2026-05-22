# Rush University System for Health — Website Style Guide

Derived from the Rush Brand Quick Guide (December 2024).

> **Two visual domains:** The chatbot shell, case selection, and conversational UI use **Rush brand styling** (sections 1-8). Clinical artifact panels — labs, EKG, imaging, vitals — use **Epic EHR styling** (section 9) so students encounter data in the same format they will see during clinical rotations at Rush.

---

## Table of Contents

1. [Brand Foundation](#1-brand-foundation)
2. [Typography](#2-typography)
3. [Color Palette](#3-color-palette)
4. [Logo Usage](#4-logo-usage)
5. [Brand Voice & Tone](#5-brand-voice--tone)
6. [Rush Component Patterns](#6-rush-component-patterns)
7. [Accessibility](#7-accessibility)
8. [Iconography & Photography](#8-iconography--photography)
9. [Clinical Artifact Panel — Epic EHR Style](#9-clinical-artifact-panel--epic-ehr-style)
10. [Unified Tailwind & CSS Tokens](#10-unified-tailwind--css-tokens)

---

## 1. Brand Foundation

### Brand Promise

**Rush is for you** — offering accessible, individualized experiences that exceed expectations and support your best outcome.

**Rush is for good** — steadfast commitment to excellent, more equitable care for all; to learn and innovate always; and to step up when others don't.

### Brand Commitments

| Commitment | Core Message | Example Messaging |
|---|---|---|
| Lead excellence | Setting the market and national standard for quality | *Going beyond excellence in everything we do.* |
| Run toward challenges | Step up to and overcome challenges others won't | *We are never done.* |
| Exceptional experience | Committed to caring, people-centered experience — physical or virtual | *Always about you.* |
| Learn and apply, always | Driven to find solutions through education and research | *Purposefully solving for the future.* |

---

## 2. Typography

### Font Stack

| Role | Font | CSS `font-family` | Usage |
|---|---|---|---|
| **Headings** | Calibre Semibold | `'Calibre', 'Helvetica Neue', sans-serif` | H1-H3, hero text, CTAs, navigation |
| **Body** | Calibre Regular | `'Calibre', 'Helvetica Neue', sans-serif` | Paragraphs, descriptions, form labels |
| **Fallback** | Georgia Regular | `Georgia, 'Times New Roman', serif` | Long-form editorial content, blockquotes |

### Type Scale

```css
:root {
  --font-heading: 'Calibre', 'Helvetica Neue', Arial, sans-serif;
  --font-body: 'Calibre', 'Helvetica Neue', Arial, sans-serif;
  --font-editorial: Georgia, 'Times New Roman', serif;

  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */
  --text-4xl: 2.25rem;   /* 36px */
  --text-5xl: 3rem;      /* 48px */
}
```

---

## 3. Color Palette

### Primary Colors

| Name | Hex | RGB | PMS | Usage |
|---|---|---|---|---|
| **Legacy Green** | `#006332` | 0, 99, 50 | 349 | Primary brand color, headers, nav, footer |
| **Growth Green** | `#30AE6E` | 48, 174, 110 | 3405 | Accents, CTAs, links, highlights |
| **Vitality Green** | `#5FEEA2` | 95, 238, 162 | 3385 | Decorative accents only (not for text on white) |

### Secondary Colors

| Name | Hex | RGB | PMS | Usage |
|---|---|---|---|---|
| **Sage Green** | `#DFF9EB` | 223, 249, 235 | 621 | Light backgrounds, cards, callout boxes |

### Extended Palette

| Hex | PMS | Suggested Use |
|---|---|---|
| `#FFC60B` | 7548 | Warnings, highlights, badges |
| `#5AAD03` | 632 | Secondary accent |
| `#005DB3` | 634 | Links (alternative), info states |
| `#2D1D4E` | 273 | Dark accent, contrast text on light bg |
| `#FFE3E0` | 266 | Error/alert backgrounds |
| `#6CA389` | 698 | Muted green accent |
| `#F2DBB3` | 7506 | Warm neutral background |
| `#AFAEAF` | 404 | Borders, disabled states, muted text |
| `#5F5B58` | 427 | Secondary text on light backgrounds |

### Neutrals

| Token | Hex | Usage |
|---|---|---|
| **Black** | `#000000` | Primary text, dark backgrounds |
| **White** | `#FFFFFF` | Page background, text on dark |

### CSS Custom Properties — Rush

```css
:root {
  /* Primary */
  --color-legacy-green: #006332;
  --color-growth-green: #30AE6E;
  --color-vitality-green: #5FEEA2;
  --color-sage-green: #DFF9EB;

  /* Extended */
  --color-gold: #FFC60B;
  --color-blue: #005DB3;
  --color-purple: #2D1D4E;
  --color-blush: #FFE3E0;
  --color-muted-green: #6CA389;
  --color-warm-neutral: #F2DBB3;
  --color-gray: #AFAEAF;
  --color-dark-gray: #5F5B58;

  /* Semantic */
  --color-primary: var(--color-legacy-green);
  --color-accent: var(--color-growth-green);
  --color-surface: var(--color-sage-green);
  --color-text: #000000;
  --color-text-secondary: var(--color-dark-gray);
  --color-border: var(--color-gray);
  --color-link: var(--color-growth-green);
  --color-link-hover: var(--color-legacy-green);
  --color-error: #D32F2F;
  --color-warning: var(--color-gold);
  --color-info: var(--color-blue);
}
```

---

## 4. Logo Usage

### Rules

- Maintain clear space equal to the height of the "x" in the logo on all sides
- Logo must be large enough to remain legible in digital application
- Logo may be used in full color, single color (white, black), or on colored backgrounds where it remains legible

### Approved Background Combinations

| Background | Logo Color |
|---|---|
| White | Full color (Legacy Green) |
| Black / Dark | White |
| Legacy Green | White |
| Growth Green | White |
| Blue | White |
| Sage Green | Full color |

### Logo Don'ts

- Do not change the logo color arbitrarily
- Do not apply patterns or textures to the logo
- Do not skew, stretch, or distort
- Do not crop or cover any part of the logo
- Do not separate the anchor icon from the wordmark in unapproved ways

### Anchor Icon

The anchor element may be used independently as a graphic element or to create texture/pattern, following the same color specifications as the full logo.

---

## 5. Brand Voice & Tone

### Personality Traits

The chatbot and all website copy should embody these four traits:

#### Inclusive
> *Real. Genuine. Thoughtful. Collaborative.*

- **Level the field** — address everyone as peers, friends, neighbors
- **Go beyond basics** — acknowledge the person, not just the condition
- **Change the dynamic** — show collaboration and partnership, not transactional language
- Write: *"Our patient Jane, who has diabetes"* not *"Jane the Diabetic"*

#### Invested
> *All in. Always on. Passionate. Dedicated.*

- **Start at their finish line** — focus on the audience's goals
- **Create momentum** — use present-tense, forward-looking language ("right now", "let's", "next")
- **Be intentional** — avoid medical jargon, cliches, puns, and tropes

#### Inventive
> *Confident. Brave. Optimistic. Inspiring.*

- **Show don't tell** — share stories and accomplishments, not just claims
- **Uplift your audience** — convey optimism and reassurance
- **Break from ordinary** — short punchy statements can complement longer ones; fragments welcome

#### Accessible
> *Open. Local. Approachable.*

- **Speak in real terms** — swap complex medical language for plain language
- **Drive home benefits** — lead with what's in it for the user
- **Celebrate local** — reference Chicago neighborhoods and community context

### Writing Guidelines for the Chatbot

| Do | Don't |
|---|---|
| Use "we" and "you" to build connection | Use cold, institutional third-person |
| Speak plainly — explain medical terms when needed | Assume the user knows medical jargon |
| Show empathy and warmth | Sound robotic or transactional |
| Highlight benefits and outcomes | Lead with features or process |
| Be concise — short sentences, fragments OK | Write long, dense paragraphs |
| Reference Chicago communities and neighborhoods | Be generic when local context applies |
| Acknowledge the whole person | Reduce someone to a diagnosis or condition |
| Use momentum words: "right now", "let's", "next step" | Use passive or stalling language |

---

## 6. Rush Component Patterns

### Buttons

```css
.btn-primary {
  background-color: var(--color-growth-green);
  color: #FFFFFF;
  font-family: var(--font-heading);
  font-weight: 600;
  border: none;
  border-radius: 4px;
  padding: 12px 24px;
  transition: background-color 0.2s ease;
}
.btn-primary:hover {
  background-color: var(--color-legacy-green);
}

.btn-secondary {
  background-color: transparent;
  color: var(--color-legacy-green);
  border: 2px solid var(--color-legacy-green);
  border-radius: 4px;
  padding: 10px 22px;
}
.btn-secondary:hover {
  background-color: var(--color-legacy-green);
  color: #FFFFFF;
}
```

### Cards

```css
.card {
  background-color: var(--color-sage-green);
  border-radius: 8px;
  padding: 24px;
  border: 1px solid var(--color-border);
}
```

### Links

```css
a {
  color: var(--color-growth-green);
  text-decoration: underline;
  transition: color 0.15s ease;
}
a:hover {
  color: var(--color-legacy-green);
}
```

### Chat Bubbles

```css
.chat-bubble--bot {
  background-color: var(--color-sage-green);
  color: var(--color-text);
  border-radius: 16px 16px 16px 4px;
  padding: 12px 16px;
  max-width: 80%;
}

.chat-bubble--user {
  background-color: var(--color-legacy-green);
  color: #FFFFFF;
  border-radius: 16px 16px 4px 16px;
  padding: 12px 16px;
  max-width: 80%;
}
```

---

## 7. Accessibility

- Minimum contrast ratio of 4.5:1 for body text, 3:1 for large text (WCAG AA)
- **Vitality Green (#5FEEA2) fails contrast on white** — use only for decorative elements, never for text or interactive elements on light backgrounds
- All interactive elements must have visible focus states
- Use `aria-label` on icon-only buttons
- Ensure all images have descriptive `alt` text
- Support keyboard navigation for all interactive components

### Tested Contrast Pairs

| Foreground | Background | Ratio | Pass? |
|---|---|---|---|
| Legacy Green | White | 7.2:1 | AA |
| Growth Green | White | 3.1:1 | Large text only |
| White | Legacy Green | 7.2:1 | AA |
| Black | Sage Green | 15.8:1 | AAA |
| Dark Gray | White | 4.6:1 | AA |

---

## 8. Iconography & Photography

### Photography Style

- Authentic, warm, people-centered imagery
- Reflect the diversity of Chicago's communities
- Show real interactions and care moments — not staged or stock-looking
- Natural lighting preferred

### Iconography

- Use the Rush anchor as a brand mark / decorative motif
- Keep icons simple and consistent in weight
- Match icon color to the surrounding text or use Growth Green for accents

---

## 9. Clinical Artifact Panel — Epic EHR Style

Clinical artifacts (labs, EKG, imaging reports, vitals) are displayed **outside** the chat conversation in a dedicated artifact panel. These components mimic **Epic Hyperspace** so students practice reading clinical data in the same visual format they will use during rotations.

### 9.1 Design Principles

- **Familiarity over beauty.** The artifact panel should feel like a clinical workstation, not a marketing page. Dense, utilitarian, information-first.
- **Rush brand stays in the shell.** The chat area, nav, case selector, and page chrome use Rush colors/fonts. The artifact panel is a separate visual context.
- **Clear boundary.** Use a visible border, inset shadow, or distinct background color to separate the artifact panel from the Rush-branded chat area.

### 9.2 Epic Color Palette

```css
:root {
  /* Epic chrome */
  --epic-header-bg: #1B3A5C;
  --epic-header-text: #FFFFFF;
  --epic-sidebar-bg: #F0F0F0;
  --epic-content-bg: #FFFFFF;
  --epic-content-border: #C8C8C8;
  --epic-row-alt: #F7F9FC;
  --epic-selected-row: #D6E4F0;
  --epic-tab-active: #FFFFFF;
  --epic-tab-inactive: #E0E0E0;

  /* Epic text */
  --epic-text-primary: #1A1A1A;
  --epic-text-secondary: #5A5A5A;
  --epic-text-link: #0060AF;

  /* Clinical severity */
  --epic-normal: #1A1A1A;
  --epic-abnormal-high: #CC0000;    /* H flag — red */
  --epic-abnormal-low: #0060AF;     /* L flag — blue */
  --epic-critical: #CC0000;         /* HH/LL flag — bold red */
  --epic-critical-bg: #FFF0F0;
  --epic-panic: #8B0000;            /* C flag — dark red */

  /* Status indicators */
  --epic-status-final: #2E7D32;
  --epic-status-pending: #E65100;
  --epic-status-preliminary: #1565C0;
}
```

### 9.3 Epic Typography

```css
.epic-artifact-panel {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-size: 13px;
  line-height: 1.4;
  color: var(--epic-text-primary);
}

.epic-artifact-panel h2 {
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  color: var(--epic-header-bg);
  border-bottom: 2px solid var(--epic-header-bg);
  padding-bottom: 4px;
  margin-bottom: 8px;
}

.epic-artifact-panel .label {
  font-size: 11px;
  font-weight: 600;
  color: var(--epic-text-secondary);
  text-transform: uppercase;
}
```

### 9.4 Lab Results Table

#### Column Structure

| Column | Width | Align | Content |
|---|---|---|---|
| Component | 30% | Left | Test name (e.g., "Sodium", "WBC") |
| Value | 15% | Right | Numeric result |
| Flag | 8% | Center | H, L, HH, LL, C, or blank |
| Units | 12% | Left | e.g., mEq/L, mg/dL, K/uL |
| Reference Range | 20% | Left | e.g., 136-145, 4.5-11.0 |
| Status | 15% | Left | Final, Pending, Preliminary |

#### Flag Conventions

| Flag | Meaning | Styling |
|---|---|---|
| *(blank)* | Normal | Default text, no special formatting |
| **H** | High | Red text (`--epic-abnormal-high`), semibold |
| **L** | Low | Blue text (`--epic-abnormal-low`), semibold |
| **HH** | Critical High | Bold red (`--epic-critical`), pink row bg |
| **LL** | Critical Low | Bold red (`--epic-critical`), pink row bg |
| **A** | Abnormal (non-numeric) | Red text, semibold |
| **C** | Critical | Dark red (`--epic-panic`), bold, pink row bg |

#### CSS

```css
.epic-lab-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.epic-lab-table thead {
  background-color: var(--epic-header-bg);
  color: var(--epic-header-text);
}

.epic-lab-table thead th {
  padding: 6px 8px;
  font-weight: 600;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  text-align: left;
  border-right: 1px solid rgba(255, 255, 255, 0.15);
}

.epic-lab-table tbody tr {
  border-bottom: 1px solid var(--epic-content-border);
}

.epic-lab-table tbody tr:nth-child(even) {
  background-color: var(--epic-row-alt);
}

.epic-lab-table td {
  padding: 5px 8px;
  vertical-align: middle;
}

.epic-lab-table td.value {
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.epic-lab-table td.flag {
  text-align: center;
  font-weight: 700;
  min-width: 32px;
}

.epic-lab-table tr.flag-high td.value,
.epic-lab-table tr.flag-high td.flag {
  color: var(--epic-abnormal-high);
  font-weight: 600;
}

.epic-lab-table tr.flag-low td.value,
.epic-lab-table tr.flag-low td.flag {
  color: var(--epic-abnormal-low);
  font-weight: 600;
}

.epic-lab-table tr.flag-critical {
  background-color: var(--epic-critical-bg);
}

.epic-lab-table tr.flag-critical td.value,
.epic-lab-table tr.flag-critical td.flag {
  color: var(--epic-panic);
  font-weight: 700;
}

.epic-lab-panel-header {
  background-color: #E8EDF2;
  font-weight: 700;
  font-size: 12px;
  padding: 6px 8px;
  color: var(--epic-header-bg);
  border-left: 3px solid var(--epic-header-bg);
}

.epic-status {
  display: inline-block;
  font-size: 10px;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 2px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.epic-status--final       { color: var(--epic-status-final);       background: #E8F5E9; }
.epic-status--pending     { color: var(--epic-status-pending);     background: #FFF3E0; }
.epic-status--preliminary { color: var(--epic-status-preliminary); background: #E3F2FD; }
```

#### Example HTML

```html
<div class="epic-artifact-panel">
  <h2>Laboratory Results</h2>
  <div class="epic-lab-meta">
    <span class="label">Collected:</span> 05/21/2026 08:15
    <span class="label">Received:</span> 05/21/2026 08:32
    <span class="label">Resulted:</span> 05/21/2026 09:01
  </div>
  <table class="epic-lab-table">
    <thead>
      <tr>
        <th>Component</th><th>Value</th><th>Flag</th>
        <th>Units</th><th>Reference Range</th><th>Status</th>
      </tr>
    </thead>
    <tbody>
      <tr class="epic-lab-panel-header">
        <td colspan="6">BASIC METABOLIC PANEL</td>
      </tr>
      <tr>
        <td>Sodium</td><td class="value">140</td><td class="flag"></td>
        <td>mEq/L</td><td>136-145</td>
        <td><span class="epic-status epic-status--final">Final</span></td>
      </tr>
      <tr class="flag-high">
        <td>Glucose</td><td class="value">242</td><td class="flag">H</td>
        <td>mg/dL</td><td>70-100</td>
        <td><span class="epic-status epic-status--final">Final</span></td>
      </tr>
      <tr class="flag-critical">
        <td>Potassium</td><td class="value">6.8</td><td class="flag">HH</td>
        <td>mEq/L</td><td>3.5-5.0</td>
        <td><span class="epic-status epic-status--final">Final</span></td>
      </tr>
      <tr class="flag-low">
        <td>CO2</td><td class="value">18</td><td class="flag">L</td>
        <td>mEq/L</td><td>22-29</td>
        <td><span class="epic-status epic-status--final">Final</span></td>
      </tr>
    </tbody>
  </table>
</div>
```

### 9.5 EKG / ECG Display

#### Grid Paper Background

```css
.epic-ecg-container {
  background-color: #FFF5F5;
  border: 1px solid var(--epic-content-border);
  border-radius: 2px;
  padding: 0;
  overflow: hidden;
}

.epic-ecg-grid {
  background-image:
    linear-gradient(to right, #F5CCCC 1px, transparent 1px),
    linear-gradient(to bottom, #F5CCCC 1px, transparent 1px),
    linear-gradient(to right, #E8A0A0 1px, transparent 1px),
    linear-gradient(to bottom, #E8A0A0 1px, transparent 1px);
  background-size: 5px 5px, 5px 5px, 25px 25px, 25px 25px;
  min-height: 400px;
  position: relative;
}
```

#### Header & Interpretation

```css
.epic-ecg-header {
  background-color: var(--epic-header-bg);
  color: var(--epic-header-text);
  padding: 8px 12px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 4px 16px;
  font-size: 12px;
}

.epic-ecg-header .label {
  font-size: 10px;
  color: #A0B4CC;
  text-transform: uppercase;
}

.epic-ecg-header .value {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.epic-ecg-interpretation {
  background-color: #FFFDE7;
  border-left: 3px solid #F9A825;
  padding: 8px 12px;
  font-size: 12px;
  font-style: italic;
  color: var(--epic-text-primary);
}
```

#### 12-Lead Layout

```css
.epic-ecg-leads {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr;
  gap: 0;
}

.epic-ecg-lead {
  position: relative;
  border-right: 1px solid #D4A0A0;
  border-bottom: 1px solid #D4A0A0;
  min-height: 100px;
}

.epic-ecg-lead-label {
  position: absolute;
  top: 4px;
  left: 6px;
  font-size: 11px;
  font-weight: 700;
  color: var(--epic-text-primary);
  background-color: rgba(255, 245, 245, 0.8);
  padding: 1px 4px;
}

.epic-ecg-rhythm-strip {
  grid-column: 1 / -1;
  min-height: 80px;
  border-top: 2px solid #D4A0A0;
}
```

#### Standard Lead Arrangement

| Column 1 | Column 2 | Column 3 | Column 4 |
|---|---|---|---|
| I | aVR | V1 | V4 |
| II | aVL | V2 | V5 |
| III | aVF | V3 | V6 |
| **Lead II rhythm strip (full width)** ||||

#### ECG Header Fields

| Field | Example |
|---|---|
| Ventricular Rate | 88 bpm |
| PR Interval | 162 ms |
| QRS Duration | 86 ms |
| QT/QTc | 380/410 ms |
| P-R-T Axes | 45 / 60 / 30 degrees |
| Machine Interpretation | "Normal sinus rhythm" (yellow box) |
| Speed | 25 mm/s |
| Gain | 10 mm/mV |

### 9.6 Imaging / Radiology Reports

Radiology reports are displayed as structured text with standard clinical sections.

```css
.epic-radiology-report {
  font-family: 'Consolas', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.6;
  background-color: var(--epic-content-bg);
  border: 1px solid var(--epic-content-border);
  padding: 16px;
  white-space: pre-wrap;
}

.epic-radiology-report .section-heading {
  font-family: 'Segoe UI', Tahoma, sans-serif;
  font-weight: 700;
  font-size: 12px;
  text-transform: uppercase;
  color: var(--epic-header-bg);
  margin-top: 12px;
  margin-bottom: 4px;
}

.epic-radiology-report .impression {
  border-left: 3px solid var(--epic-header-bg);
  padding-left: 12px;
  font-weight: 600;
}

.epic-radiology-report .report-header {
  background-color: var(--epic-header-bg);
  color: var(--epic-header-text);
  padding: 8px 12px;
  margin: -16px -16px 12px -16px;
  font-family: 'Segoe UI', Tahoma, sans-serif;
  font-size: 13px;
}
```

#### Report Section Order

1. **Header** — Exam type, date/time, ordering provider, reading radiologist
2. **Clinical Indication** — Why the study was ordered
3. **Technique** — Imaging modality and protocol
4. **Comparison** — Prior studies used for comparison
5. **Findings** — Detailed observations by anatomic region
6. **Impression** — Summary diagnosis/conclusions (visually emphasized)

#### Example HTML

```html
<div class="epic-radiology-report">
  <div class="report-header">
    <strong>XR CHEST 2 VIEWS</strong><br>
    05/21/2026 07:45 | Ordered by: Dr. Smith | Read by: Dr. Johnson
  </div>
  <div class="section-heading">CLINICAL INDICATION</div>
  Shortness of breath, rule out pneumonia.
  <div class="section-heading">TECHNIQUE</div>
  PA and lateral views of the chest.
  <div class="section-heading">COMPARISON</div>
  Chest radiograph dated 03/15/2026.
  <div class="section-heading">FINDINGS</div>
  Heart size is normal. Mediastinal contours are unremarkable.
  There is a patchy opacity in the right lower lobe. No pleural
  effusion. No pneumothorax.
  <div class="section-heading">IMPRESSION</div>
  <div class="impression">
  1. Right lower lobe opacity concerning for pneumonia.
     Clinical correlation recommended.
  2. No acute cardiopulmonary abnormality otherwise.
  </div>
</div>
```

### 9.7 Vitals Flowsheet

```css
.epic-vitals-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.epic-vitals-table thead th {
  background-color: var(--epic-header-bg);
  color: var(--epic-header-text);
  padding: 5px 8px;
  font-size: 11px;
  font-weight: 600;
  text-align: center;
  border-right: 1px solid rgba(255, 255, 255, 0.15);
}

.epic-vitals-table thead th:first-child {
  text-align: left;
  width: 140px;
}

.epic-vitals-table td {
  padding: 4px 8px;
  text-align: center;
  border-bottom: 1px solid var(--epic-content-border);
  border-right: 1px solid var(--epic-content-border);
  font-variant-numeric: tabular-nums;
}

.epic-vitals-table td:first-child {
  text-align: left;
  font-weight: 600;
  background-color: #F5F7FA;
}

.epic-vitals-table td.abnormal {
  color: var(--epic-abnormal-high);
  font-weight: 700;
}
```

#### Vitals Display Format

| Vital | Format | Units |
|---|---|---|
| Blood Pressure | 120/80 | mmHg |
| Heart Rate | 88 | bpm |
| Respiratory Rate | 16 | /min |
| Temperature | 98.6 | F (or C) |
| SpO2 | 98 | % |
| Pain | 3 | /10 |

### 9.8 Artifact Panel Container

```css
.artifact-panel {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #F5F7FA;
  border-left: 1px solid #D0D5DD;
  box-shadow: inset 2px 0 4px rgba(0, 0, 0, 0.04);
  overflow-y: auto;
  padding: 0;
}

.artifact-panel-tabs {
  display: flex;
  background-color: var(--epic-sidebar-bg);
  border-bottom: 1px solid var(--epic-content-border);
  padding: 0 8px;
}

.artifact-panel-tab {
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 600;
  color: var(--epic-text-secondary);
  background-color: var(--epic-tab-inactive);
  border: 1px solid var(--epic-content-border);
  border-bottom: none;
  border-radius: 4px 4px 0 0;
  margin-right: 2px;
  cursor: pointer;
}

.artifact-panel-tab.active {
  background-color: var(--epic-tab-active);
  color: var(--epic-text-primary);
  border-bottom: 1px solid var(--epic-tab-active);
  margin-bottom: -1px;
}
```

### 9.9 Design Boundary Summary

| Element | Visual System | Font | Color Palette |
|---|---|---|---|
| Page shell, nav, footer | **Rush** | Calibre | Legacy Green, Growth Green |
| Case selection tiles | **Rush** | Calibre | Rush palette |
| Chat conversation | **Rush** | Calibre | Sage Green, Legacy Green |
| Chat input area | **Rush** | Calibre | Rush palette |
| Lab results table | **Epic** | Segoe UI | Navy, red/blue flags |
| EKG display | **Epic** | Segoe UI | Pink grid, navy header |
| Radiology report | **Epic** | Consolas / Segoe UI | Navy headers, white bg |
| Vitals flowsheet | **Epic** | Segoe UI | Navy, red abnormals |
| Artifact panel tabs | **Epic** | Segoe UI | Gray tabs, navy active |

---

## 10. Unified Tailwind & CSS Tokens

Single Tailwind config covering both Rush and Epic design systems:

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        rush: {
          'legacy':    '#006332',
          'growth':    '#30AE6E',
          'vitality':  '#5FEEA2',
          'sage':      '#DFF9EB',
          'gold':      '#FFC60B',
          'blue':      '#005DB3',
          'purple':    '#2D1D4E',
          'blush':     '#FFE3E0',
          'muted':     '#6CA389',
          'warm':      '#F2DBB3',
          'gray':      '#AFAEAF',
          'dark-gray': '#5F5B58',
        },
        epic: {
          'navy':           '#1B3A5C',
          'sidebar':        '#F0F0F0',
          'row-alt':        '#F7F9FC',
          'selected':       '#D6E4F0',
          'border':         '#C8C8C8',
          'text':           '#1A1A1A',
          'text-secondary': '#5A5A5A',
          'link':           '#0060AF',
          'high':           '#CC0000',
          'low':            '#0060AF',
          'critical':       '#8B0000',
          'critical-bg':    '#FFF0F0',
          'final':          '#2E7D32',
          'pending':        '#E65100',
          'preliminary':    '#1565C0',
          'ecg-paper':      '#FFF5F5',
          'ecg-minor':      '#F5CCCC',
          'ecg-major':      '#E8A0A0',
        },
      },
      fontFamily: {
        heading:   ['Calibre', 'Helvetica Neue', 'Arial', 'sans-serif'],
        body:      ['Calibre', 'Helvetica Neue', 'Arial', 'sans-serif'],
        editorial: ['Georgia', 'Times New Roman', 'serif'],
        clinical:  ['Segoe UI', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif'],
        mono:      ['Consolas', 'Courier New', 'monospace'],
      },
    },
  },
};
```

---

*Source: Rush Brand Quick Guide, December 16, 2024 | Visit brand.rush.edu for full standards.*
*Epic EHR styling based on Epic Hyperspace clinical interface conventions. Epic is a registered trademark of Epic Systems Corporation.*
