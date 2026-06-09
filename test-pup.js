const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('majestan_access_token', 'test');
  });
  await page.goto('http://localhost:3000/admin/sublocations/new', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: 'screenshot.png' });
  const text = await page.content();
  console.log("HTML length:", text.length);
  console.log("Has Select:", text.includes('<select'));
  const selectBox = await page.$('select');
  if (selectBox) {
    const isVisible = await selectBox.isVisible();
    console.log("Select is visible:", isVisible);
    const box = await selectBox.boundingBox();
    console.log("Box:", box);
    
    // Evaluate full CSS
    const css = await page.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return { display: style.display, visibility: style.visibility, width: style.width, height: style.height };
    }, selectBox);
    console.log("CSS:", css);
  }
  await browser.close();
})();
