const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Set up local storage mock for token if needed, but the page might just load anyway.
  await page.addInitScript(() => {
    window.localStorage.setItem('majestan_access_token', 'mock_token');
  });

  await page.goto('http://localhost:3000/admin/sublocations/new');
  await page.waitForLoadState('networkidle');

  const html = await page.content();
  console.log("Found Select Tag:", html.includes('<select'));
  
  const selectBox = await page.$('select');
  if (selectBox) {
    const isVisible = await selectBox.isVisible();
    const box = await selectBox.boundingBox();
    const computedStyle = await selectBox.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        display: style.display,
        visibility: style.visibility,
        opacity: style.opacity,
        width: style.width,
        height: style.height,
        appearance: style.appearance
      };
    });
    console.log("Select is visible:", isVisible);
    console.log("Bounding box:", box);
    console.log("Computed styles:", computedStyle);
    
    const options = await page.$$eval('select option', opts => opts.map(o => o.textContent));
    console.log("Options:", options);
  } else {
    console.log("Select box not found!");
  }
  
  await browser.close();
})();
