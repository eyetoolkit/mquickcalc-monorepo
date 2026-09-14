window.COVER_DATA = {};
// Cover by mQuickCalc — static insurance rate data
// All values are industry averages from NAIC, III, CMS, and state insurance departments.
// Updated for 2026. Not a quote.
fetch('/data/car-insurance-rates.json').then(r => r.json()).then(d => window.COVER_DATA.car_rates = d).catch(() => {});
fetch('/data/life-insurance-rates.json').then(r => r.json()).then(d => window.COVER_DATA.life_rates = d).catch(() => {});
fetch('/data/health-insurance-rates.json').then(r => r.json()).then(d => window.COVER_DATA.health_rates = d).catch(() => {});
fetch('/data/home-insurance-rates.json').then(r => r.json()).then(d => window.COVER_DATA.home_rates = d).catch(() => {});
