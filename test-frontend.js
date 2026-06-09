const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err));
  await page.goto('http://localhost:3000/admin/sublocations/new', { waitUntil: 'networkidle' });
  const selectExists = await page.evaluate(() => {
    const sel = document.querySelector('select');
    return sel ? { visible: sel.offsetParent !== null, html: sel.outerHTML } : null;
  });
  console.log('SELECT INFO:', selectExists);
  await browser.close();
})();
