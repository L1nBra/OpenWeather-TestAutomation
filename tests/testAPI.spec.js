const fs = require('fs');
const { test, expect } = require('@playwright/test');

let apikey;
apikey = fs.readFileSync('./tests/data/apikey.txt', 'utf8');
console.log("API key was retrieved successfully");

/*
//Setting up before all tests//MANDATORY PREREQUISITE
test.describe('Reading/Retrieval of API key', () => {
  test.beforeAll(async () => {
    // Retrieve and store API key before all test suites
    console.log("Attempting to retrieve appid...");
    apikey = fs.readFileSync('./tests/data/apikey.txt', 'utf8');
    console.log("Retrieved appid:", apikey);
 });
*/

  //TEST1
  test.describe('OpenWeatherMap API Test by longitude, latitude', () => {
    test('Positive test case with correct latitude and longitude values', async ({ request }) => {
      const url = 'https://api.openweathermap.org/data/2.5/weather';
      const params = {
        lat: '35',
        lon: '139',
        appid: apikey
      };

      console.log("Sending GET request to API...");
      const response = await request.get(url, { params });

      //Check response status, if 401 terminate the execution
      if (response.status()===401){
      console.log("IMPORTANT!!! API key is still not activated, please retry later (activation can take even up to two hours");
      process.exit(1);
      } else if(response.status() === 200) {
            await expect(response).toBeOK();
            console.log("Response status is 200 - OK.");
            }
      else{
       console.log("Unhandled response status:", response.status());
      }

      //Check that response is in JSON format
      const jsonResponse = await response.json();
      expect(jsonResponse).toBeInstanceOf(Object);
      console.log("Response is valid JSON.");

      //Check structure of JSON (few properties form structure)
      expect(jsonResponse).toHaveProperty('coord');
      expect(jsonResponse.coord).toHaveProperty('lon');
      expect(jsonResponse.coord).toHaveProperty('lat');
      console.log("JSON includes 'coord' with 'lon' and 'lat' properties.");
      expect(jsonResponse).toHaveProperty('weather');
      console.log("JSON includes 'weather' property.");
      expect(jsonResponse).toHaveProperty('main');
      console.log("JSON includes 'main' property.");
      expect(jsonResponse).toHaveProperty('wind');
      console.log("JSON includes 'wind' property.");
    });
  });


  //TEST2
  test.describe('OpenWeatherMap API Negative Test by longitude, latitude', () => {
    test('Negative test case with incorrect latitude and longitude', async ({ request }) => {
      const url = 'https://api.openweathermap.org/data/2.5/weather';
      const params = {
        lat: '91',  //correct values would be (-90;90)
        lon: '181', //correct values would be (-180;180)
        appid: apikey
      };

      console.log("Sending GET request to API...");
      const response = await request.get(url, { params });
      //Check response status
          //TO DELETE!!!?? await expect(response).not.toBeOK();
          await expect(response.status()).toBe(400);
          console.log("Incorrect parameters led to expected error status");
    });
  });

  //TEST3
  test.describe('OpenWeatherMap API Test by City Name', () => {
    test('Positive test case with correct city name', async ({ request }) => {
      const url = 'https://api.openweathermap.org/data/2.5/weather';
      const params = {
        q: 'Vilnius',
        appid: apikey
      };

      console.log("Sending GET request to API...");
      const response = await request.get(url, { params });
      //Check response status
      await expect(response).toBeOK();
      console.log("Response status is 200 - OK.");

      //Check that response is in JSON format
      const jsonResponse = await response.json();
      expect(jsonResponse).toBeInstanceOf(Object);
      console.log("Response is valid JSON.");

      //Check structure of JSON (few properties form structure)
      expect(jsonResponse).toHaveProperty('coord');
      expect(jsonResponse.coord).toHaveProperty('lon');
      expect(jsonResponse.coord).toHaveProperty('lat');
      console.log("JSON includes 'coord' with 'lon' and 'lat' properties.");
      expect(jsonResponse).toHaveProperty('weather');
      console.log("JSON includes 'weather' property.");
      expect(jsonResponse).toHaveProperty('main');
      console.log("JSON includes 'main' property.");
      expect(jsonResponse).toHaveProperty('wind');
      console.log("JSON includes 'wind' property.");
    });
  });


  //TEST4
  test.describe('OpenWeatherMap API Negative Test by City Name', () => {
    test('Negative test case with incorrect city name', async ({ request }) => {
      const url = 'https://api.openweathermap.org/data/2.5/weather';
      const params = {
        q: 'Vylnius',
        appid: apikey
      };

      console.log("Sending GET request to API...");
      const response = await request.get(url, { params });
      //Check response status
      await expect(response.status()).toBe(404);
      console.log("Incorrect parameters led to expected error status.");
    });
  });

//});

