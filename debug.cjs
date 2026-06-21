const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  await page.goto('http://localhost:5173/dosen/kelola-sesi-pertemuan/019ee464-302a-72ec-a180-85ea2acd6f33/kelas/019ee464-302a-72ec-a180-85ea2acd6f33/pertemuan/27ae1ffb-ed05-4021-a8c4-a285dd51e23d', {waitUntil: 'networkidle2'});
  const html = await page.content();
  if (html.includes('ERROR DUMP')) {
    console.log("HTML contains ERROR DUMP!");
    console.log(html.substring(html.indexOf('ERROR DUMP'), html.indexOf('ERROR DUMP') + 1000));
  }
  await browser.close();
})();
