import { chromium } from 'playwright';
const browser = await chromium.launch({ executablePath: '/home/zendex/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome', args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
await page.goto('http://localhost:3001/', { waitUntil: 'networkidle', timeout: 45000 });
await page.waitForTimeout(1500);
const layout = await page.evaluate(() => {
  const sec = document.querySelector('section.relative');
  const box = sec ? sec.querySelector(':scope > div.relative') : null;
  const search = document.querySelector('section.relative input');
  const strip = [...document.querySelectorAll('section.relative a')].find(a => a.textContent?.includes('Apartment'));
  const r = (el) => { if (!el) return null; const b = el.getBoundingClientRect(); return { top: Math.round(b.top), bottom: Math.round(b.bottom) }; };
  return { section: r(sec), bannerBox: r(box), search: r(search), stripLink: r(strip) };
});
console.log(JSON.stringify(layout, null, 1));
await browser.close();
