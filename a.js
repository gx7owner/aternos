const puppeteer = require('puppeteer');

const email = 'YOUR_EMAIL';
const password = 'YOUR_PASSWORD';

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();

  // 1. Go to login page
  await page.goto('https://aternos.org/go/');
  await page.waitForSelector('#login');

  // 2. Log in
  await page.type('#user', email);
  await page.type('#password', password);
  await page.click('#login');

  await page.waitForNavigation();

  // 3. Go to server page
  await page.goto('https://aternos.org/server/');

  // 4. Start the server if it's offline
  await page.waitForSelector('#start');

  const isOnline = await page.evaluate(() => {
    return document.querySelector('#statuslabel').textContent.includes("Online");
  });

  if (!isOnline) {
    console.log('Starting server...');
    await page.click('#start');
  } else {
    console.log('Server is already online.');
  }

  // 5. Keep monitoring for countdown
  while (true) {
    await page.waitForTimeout(10000); // check every 10 seconds

    const countdown = await page.evaluate(() => {
      const text = document.querySelector('#statuslabel')?.textContent || '';
      const match = text.match(/(\d+):(\d+)/); // mm:ss
      if (match) {
        return parseInt(match[1]) * 60 + parseInt(match[2]); // total seconds
      }
      return null;
    });

    if (countdown !== null) {
      console.log(`Server countdown: ${countdown} seconds`);
    }

    if (countdown !== null && countdown <= 60) {
      const extendButtonExists = await page.evaluate(() => {
        const btn = document.querySelector('.extend-button');
        return btn !== null;
      });

      if (extendButtonExists) {
        console.log("Extending server by 1 minute...");
        await page.click('.extend-button');
      }
    }
  }

  // Never closes, keeps watching
})();
