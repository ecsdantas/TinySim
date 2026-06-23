const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto('http://localhost:5181/');
  await page.waitForTimeout(800);

  // close welcome toast if present
  const toastClose = await page.$('.Toastify__close-button');
  if (toastClose) await toastClose.click();

  // canvas + menubar + zoombar
  await page.screenshot({ path: '_canvas.png' });

  // open file dropdown
  await page.click('img[title="File options"]');
  await page.waitForTimeout(300);
  await page.screenshot({ path: '_dropdown.png' });

  // open samples modal
  await page.click('li:has-text("Samples diagram")');
  await page.waitForTimeout(600);
  await page.screenshot({ path: '_modal.png' });

  await browser.close();
})();
