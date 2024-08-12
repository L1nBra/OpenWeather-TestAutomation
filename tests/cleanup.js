const fs = require('fs');
const path = require('path');
const util = require('util');
const { chromium } = require('playwright');

//Promisify readFile and unlink to use with async/await
const writeFile = util.promisify(fs.writeFile);
const readdir = util.promisify(fs.readdir);
const unlink = util.promisify(fs.unlink);

const filePath = path.join(__dirname, 'data','apikey.txt');
const screenshotsDirectory = path.join(__dirname, 'testsScreenShots');

async function cleanup() {
    //Removing apikey content
    try {
        await writeFile(filePath, '');
        console.log('Text file cleaned successfully');
    } catch (err) {
        console.error('Failed to clean up text file:', err);
    }

    //Delete Screenshots directory content
    try {
        const countDeleted = await deletePNGFiles(screenshotsDirectory);
        console.log(`${countDeleted} PNG file(s) deleted successfully`);
    } catch (err) {
        console.error("Failed to delete screenshots:", err);
    }

    //Delete newly created and changed api keys inside web page
        try {
            await interactWithWebpage();
        } catch (err) {
            console.error("Failed to interact with webpage:", err);
        }
 }

cleanup();


//Function to delete all PNG files in a directory
async function deletePNGFiles(directory) {
    const files = await readdir(directory);
    const deletePromises = files
        .filter(file => file.toLowerCase().endsWith('.png'))
        .map(file => unlink(path.join(directory, file)));

    //Await all the delete operations
    await Promise.all(deletePromises);
    //Return the number of deleted files
    return deletePromises.length;
}

//Function to interact with a webpage (Would be better to do a bulk deletion using API)
async function interactWithWebpage() {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('https://home.openweathermap.org/');

    //Fill login details
      await page.fill('#user_email', 'telag72861@qodiq.com');
      await page.fill('#user_password', 'testLB123');
    //Submit Login
        const [response] = await Promise.all([
          page.waitForNavigation({ waitUntil: 'networkidle' }),
          page.click('input[type="submit"][name="commit"][value="Submit"]')
        ]);
        console.log('Logged in');

      //Navigate to API keys
      await page.click('#user-dropdown');

          await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle' }),
            page.click('text="My API keys"')
          ]);

          //Find API key which name was changed
          const apiKey = 'TestKey1Changed';
              const deletionSuccessful = await deleteEntryByName(page, apiKey);
              if (deletionSuccessful) {
                  console.log('Changed API keys deleted successfully');
              } else {
                  console.log('No entry found with the specified name.');
              }

          //Logout
            await page.click('#user-dropdown');
                await Promise.all([
                  page.waitForNavigation({ waitUntil: 'networkidle' }),
                  page.click('text="Logout"')
                ]);
            console.log('Logged out from the Webpage');

    await browser.close();
}

//Function to find and delete an entry by name from a table
async function deleteEntryByName(page, apiKey) {
    //Select the rows and find the row where the name matches apiKey
    await page.waitForSelector('.material_table.api-keys tbody tr', { state: 'attached' });
    const selector = '.material_table.api-keys tbody tr';
    let entriesDeleted = false;

    while (true){

    const rows = await page.$$(selector);
    if (rows.length === 0) {
     if(entriesDeleted){
     console.log("All matching entries have been deleted");
     } else {
     console.log("No rows found. Check if the table is correctly loaded.");
     }
     break;
    }

    let matchingFound = false;
    for (let row of rows) {
    const name = await row.$eval('td:nth-child(2)', td => td.textContent.trim());

     if (name === apiKey) {
            matchingFound = true;
            //Click the delete button for the matched row
            const deleteButton = await row.$('.edit_key_btn[data-confirm="Do you want to remove this key?"]');
            if (deleteButton) {
              //Listen for the dialog that will appear when delete button is clicked
                    page.once('dialog', async dialog => {
                        //console.log(`Dialog message: ${dialog.message()}`);
                        await dialog.accept();  // Click "OK" in the dialog
                    });
                    await deleteButton.click();
                    await page.waitForTimeout(1000);
                    entriesDeleted = true;
                    break;
        }
     }
   }
    if(!matchingFound){
     break;
    }
 }
    return entriesDeleted;
}