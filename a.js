const puppeteer = require('puppeteer');

const USERNAME = 'hxrshadow'; // <<-- Replace with your Aternos username
const PASSWORD = 'hxrshadow'; // <<-- Replace with your Aternos password

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  console.log("Logging in...");
  await page.goto('https://aternos.org/go/', { waitUntil: 'networkidle2' });

  await page.waitForSelector('#user');
  await page.type('#user', USERNAME);
  await page.type('#password', PASSWORD);
  await page.click('#login');

  await page.waitForNavigation({ waitUntil: 'networkidle2' });

  console.log("Logged in, navigating to server page...");
  await page.goto('https://aternos.org/server/', { waitUntil: 'networkidle2' });

  // Wait for page to load status
  await page.waitForSelector('#start');

  const statusText = await page.evaluate(() => {
    return document.querySelector('#statuslabel')?.innerText || '';
  });

  if (statusText.includes("Offline")) {
    console.log("Server is offline. Starting it...");
    await page.click('#start');
  } else {
    console.log("Server is already online or starting...");
  }

  // Monitoring loop
  console.log("Monitoring server for countdown...");

  while (true) {
    await page.waitForTimeout(15000); // 15 seconds

    const countdownSeconds = await page.evaluate(() => {
      const label = document.querySelector('#statuslabel');
      if (!label) return null;

      const match = label.textContent.match(/(\d+):(\d+)/); // mm:ss
      if (match) {
        return parseInt(match[1]) * 60 + parseInt(match[2]);
      }

      return null;
    });

    if (countdownSeconds !== null) {
      console.log(`Countdown: ${countdownSeconds} seconds`);

      if (countdownSeconds <= 60) {
        const extended = await page.evaluate(() => {
          const button = document.querySelector('.extend-button');
          if (button) {
            button.click();
            return true;
          }
          return false;
        });

        if (extended) {
          console.log("Extended server time by 1 minute.");
        }
      }
    }
  }
})();
