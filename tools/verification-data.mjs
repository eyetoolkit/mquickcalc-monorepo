#!/usr/bin/env node
/**
 * C1 verifiability metadata — single source of truth for the finance tool pages.
 *
 * Consumed by tools/build.mjs (CI build-time injection) and by the local
 * c1-fix.py preview/verification harness. Do not hand-edit the generated
 * HTML panels: edit this file and re-run `node tools/build.mjs site-finance`.
 *
 * Rule: only URLs that returned HTTP 2xx in the 2026-11-08 reachability check
 * are published. A platform whose pricing page could not be confirmed (403 /
 * timeout from the checker) gets an honest text note instead of a link.
 */
export const VERIFIED_ON = '2026-11-08';
export const REPO_URL = 'https://github.com/eyetoolkit/mquickcalc-monorepo';
export const ORG_URL = 'https://github.com/eyetoolkit';
export const MAINTAINER = 'Jim (Maoming, Guangdong, China)';
export const CHANGELOG = '2026-11-08 — Added this verification panel (last verified date, official or methodology source, test coverage, named maintainer, changelog). Calculator logic and default rates are unchanged.';
// Filled from the real `node tools/test-regressions.mjs` run on VERIFIED_ON.
export const REGRESSION = { passed: 39, total: 39, runOn: '2026-11-08' };

// Verified 2xx official / authoritative sources (checked 2026-11-08).
export const OFFICIAL = {
  'airbnb-host-fee-calculator': ['Airbnb host service fee — official help centre', 'https://www.airbnb.com/help/article/2503'],
  'amazon-fba-revenue-calculator': ['Amazon selling fees — official pricing', 'https://sell.amazon.com/pricing'],
  'amazon-fbm-profit-calculator': ['Amazon selling fees — official pricing', 'https://sell.amazon.com/pricing'],
  'booking-fee-calculator': ['Booking.com partner portal — commission terms', 'https://partner.booking.com/'],
  'ebay-fee-calculator': ['eBay selling fees — official help centre', 'https://www.ebay.com/help/selling/fees-credits-invoices/selling-fees?id=4822'],
  'ebay-international-fee-calculator': ['eBay selling fees — official help centre', 'https://www.ebay.com/help/selling/fees-credits-invoices/selling-fees?id=4822'],
  'etsy-eu-vat-calculator': ['European Commission — official VAT rates', 'https://taxation-customs.ec.europa.eu/taxation/vat/vat-rates_en'],
  'vat-calculator': ['European Commission — official VAT rates', 'https://taxation-customs.ec.europa.eu/taxation/vat/vat-rates_en'],
  'paypal-fee-calculator': ['PayPal merchant fees — official', 'https://www.paypal.com/us/business/paypal-business-fees'],
  'shopify-fees-calculator': ['Shopify pricing — official', 'https://www.shopify.com/pricing'],
  'stripe-fee-calculator': ['Stripe pricing — official', 'https://stripe.com/pricing'],
  'vrbo-host-fee-calculator': ['Vrbo host fees — official help centre', 'https://help.vrbo.com/articles/What-fees-do-I-pay-as-a-property-owner'],
  'income-tax-calculator': ['IRS — federal income tax rates and brackets', 'https://www.irs.gov/filing/federal-income-tax-rates-and-brackets'],
  'paycheck-calculator': ['IRS — tax withholding estimator', 'https://www.irs.gov/individuals/tax-withholding-estimator'],
  'compound-interest-calculator': ['Federal Reserve — policy interest rates', 'https://www.federalreserve.gov/monetarypolicy/openmarket.htm'],
  'savings-calculator': ['Federal Reserve — policy interest rates', 'https://www.federalreserve.gov/monetarypolicy/openmarket.htm'],
};

// Platform fee pages whose official URL could not be confirmed reachable by the
// automated checker on 2026-11-08 (403 / network timeout). We say so instead of
// publishing an unverified link.
export const FEE_NOTE = [
  'etsy-fee-calculator', 'etsy-offsite-ads-calculator', 'gumroad-fee-calculator',
  'patreon-fee-calculator', 'kickstarter-fee-calculator', 'poshmark-fee-calculator',
  'multi-platform-fee-comparison', 'secondhand-platform-fee-calculator',
  'youtube-money', 'youtube-rpm-by-country', 'twitch-bits-to-usd', 'twitch-sub-revenue',
];

const START = '<!-- C1:VERIFY:START -->';
const END = '<!-- C1:VERIFY:END -->';
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function buildVerificationPanel(slug) {
  const src = OFFICIAL[slug];
  const feeNote = FEE_NOTE.includes(slug);
  const sourceLine = src
    ? `<a href="${esc(src[1])}" rel="noopener noreferrer nofollow" target="_blank">${esc(src[0])}</a> — confirmed reachable on ${VERIFIED_ON}.`
    : feeNote
      ? `This is a platform fee estimator. Its calculation is documented in the <a href="${REPO_URL}" rel="noopener noreferrer nofollow" target="_blank">project source</a>; we could not confirm the platform's official pricing/help page was reachable on ${VERIFIED_ON}, so we do not publish an unverified link.`
      : `No platform fee schedule applies to this calculator. Its formula is documented in the <a href="${REPO_URL}" rel="noopener noreferrer nofollow" target="_blank">project source</a> and exercised by the regression suite linked below.`;
  const note = feeNote
    ? ` <strong>Current fees:</strong> confirm the live rate on the platform's own pricing or help page before relying on this estimate. We deliberately do not link to a page we could not confirm as reachable on ${VERIFIED_ON}.`
    : '';
  const r = REGRESSION;
  return `${START}
<style>
.mqcv{margin:28px 0;padding:18px 20px;border:1px solid #d9e2ea;border-radius:12px;background:#f7fafc;color:#1e293b;font-size:14px;line-height:1.62}
.mqcv h2{margin:0 0 10px;font-size:19px;color:#0f766e}
.mqcv dl{margin:0;display:grid;gap:8px}
.mqcv dt{font-weight:700;color:#0f172a}
.mqcv dd{margin:0}
.mqcv a{color:#0f766e;text-decoration:underline}
.mqcv code{background:#e8eef4;padding:1px 4px;border-radius:4px}
@media (prefers-color-scheme:dark){.mqcv{background:#131c25;border-color:#2b3a47;color:#d7e0e8}.mqcv dt{color:#f1f5f9}.mqcv h2,.mqcv a{color:#5eead4}.mqcv code{background:#22303c}}
</style>
<section class="mqcv" data-verify="v1" aria-labelledby="mqcv-h">
  <h2 id="mqcv-h">How to verify this calculator</h2>
  <dl>
    <div><dt>Last verified</dt><dd><time datetime="${VERIFIED_ON}">8 November 2026</time> — the calculation logic and the automated regression suite were re-run on this date. Fee and rate fields are editable estimates; confirm current values against the official schedule before relying on them.</dd></div>
    <div><dt>Official / methodology source</dt><dd>${sourceLine}${note}</dd></div>
    <div><dt>Method &amp; testing</dt><dd>All arithmetic runs locally in your browser — no input is uploaded. Calculation behaviour is exercised by the repository's regression suite: <strong>${r.passed}/${r.total} checks passed</strong> (run ${r.runOn}). <a href="${REPO_URL}" rel="noopener noreferrer nofollow" target="_blank">Source &amp; tests on GitHub</a>.</dd></div>
    <div><dt>Maintained by</dt><dd>${esc(MAINTAINER)} · <a href="${ORG_URL}" rel="noopener noreferrer nofollow" target="_blank">eyetoolkit</a>. Report a wrong result through the <a href="/contact">contact page</a>.</dd></div>
    <div><dt>Changelog</dt><dd>${esc(CHANGELOG)}</dd></div>
  </dl>
</section>
${END}`;
}
