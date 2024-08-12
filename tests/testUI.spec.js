const { chromium, test, expect } = require("@playwright/test");
const fs = require('fs');

test("OpenWeather UI test for creating, editing and saving API key", async ({ browser }) => {
const context = await browser.newContext();
const page = await context.newPage();

//Navigate to a website
  await page.goto('https://home.openweathermap.org/');

//Fill login details
  await page.fill('#user_email', 'telag72861@qodiq.com');
  await page.fill('#user_password', 'testLB123');

//Take a screenshot
 await page.screenshot({ path: `./tests/testsScreenshots/LoginPage-${Date.now()}.png` });

//Submit Login
  const [response] = await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle' }),
    page.click('input[type="submit"][name="commit"][value="Submit"]')
  ]);

//Navigate to API keys
await page.screenshot({ path: `./tests/testsScreenshots/SuccessfulLogin-${Date.now()}.png` });

await page.click('#user-dropdown');

await page.screenshot({ path: `./tests/testsScreenshots/UserDropDown-APIKeys-${Date.now()}.png` });

    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle' }),
      page.click('text="My API keys"')
    ]);

await page.screenshot({ path: `./tests/testsScreenshots/ApiKeysPage-${Date.now()}.png` });

//create API key
let apiKey = 'TestKey1';
await page.fill('#api_key_form_name', apiKey);
await page.click('input[type="submit"][name="commit"][value="Generate"]');

 await page.waitForSelector('.material_table.api-keys', { state: 'visible' });

  //Find created API key
  const entrySelector = `.material_table.api-keys td:has-text("${apiKey}")`;
  const entry = await page.$(entrySelector);

  if (entry) {
    console.log('API key was successfully created');
  } else {
    console.error('Newly create api key not found');
  }

await page.screenshot({ path: `./tests/testsScreenshots/NewAPIKey-${Date.now()}.png` });

//Edit API key
await page.click(`.edit_key_btn.edit-key-btn[data-name="${apiKey}"]`);
apiKey += 'Changed';
await page.fill('#edit_key_form_name', apiKey);

await page.screenshot({ path: `./tests/testsScreenshots/EditAPIKey-${Date.now()}.png` });

await page.click('button.button-round.dark:text("Save")');

await page.screenshot({ path: `./tests/testsScreenshots/ChangedAPIKey-${Date.now()}.png` });

//Check that newly created API key name was changed
  const entrySelector2 = `.material_table.api-keys td:has-text("${apiKey}")`;
  const entry2 = await page.$(entrySelector2);

  if (entry2) {
    console.log('API key name was successfully edited');
  } else {
    console.error('API key changed name not found');
  }

//Find API key itself(value) with changed name and save it into txt file
  await page.waitForSelector('.material_table.api-keys');
  let keys = await page.$$eval('.material_table.api-keys tr', (rows, apiKey) => {
    //Iterate over each row and return the key if name matches apiKey
    for (let row of rows) {
      const name = row.cells[1].textContent.trim();
      const key = row.cells[0].textContent.trim();
      if (name === apiKey) {
        return key;
      }
    }
    return null;
  }, apiKey);

  if (keys) {
    console.log('API key with changed name found');
    fs.writeFileSync('./tests/data/apikey.txt', keys);
    console.log('API key with changed name found and saved to txt file');
  } else {
    console.log('No matching key found');
  }

  //Logout
  await page.click('#user-dropdown');
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle' }),  // Adjust waitUntil as necessary
        page.click('text="Logout"') // Replace "Option Text" with the actual text
      ]);
  console.log('Logged out from the Webpage');
  await page.screenshot({ path: `./tests/testsScreenshots/LogoutPage-${Date.now()}.png` });

  await browser.close();

});
