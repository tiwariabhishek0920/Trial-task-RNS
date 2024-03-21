const sqlite3 = require('sqlite3').verbose();
const { scheduleJob } = require('node-schedule');
const puppeteer = require('puppeteer');


//Connect to SQLite database
const db = new sqlite3.Database('gas_prices.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the gas prices database.');
    }
});

//Create gas_prices table if not exists
db.run(`CREATE TABLE IF NOT EXISTS gas_prices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        dollarPrice REAL,
        nAVAXPrice REAL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
    if (err) {
        console.error('Error creating table:', err.message);
    }
});

//Function to scrape and store gas price
async function scrapeAndStoreGasPrice() {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        // Navigate to the webpage
        await page.goto('https://snowtrace.io/', { waitUntil: 'networkidle2' });

        // Define XPath selector for the parent's parent element
        const parentElementXPath = '//span[contains(text(), "Med Gas Price")]/ancestor::div[1]/ancestor::div[1]';

        // Evaluate XPath expression to find the parent's parent element
        const parentElementHandle = await page.evaluateHandle((xpath) => {
            return document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        }, parentElementXPath);

        // Convert parent element handle to Puppeteer element handle
        const parentElement = await parentElementHandle.asElement();

        if (parentElement) {
            //const parentElementHTML = await page.evaluate(element => element.outerHTML, parentElement);
           // console.log("Parent Element HTML:", parentElementHTML);
            // Get the inner text of the nAVAX and $ elements
            const nAVAXElement = await parentElement.$('.text-link');
            const dollarElement = await parentElement.$('.text-slate-500');

            if (nAVAXElement && dollarElement) {
                const nAVAXValue = await page.evaluate(element => element.textContent.trim().split(' ')[0], nAVAXElement);
                const dollarValue = await page.evaluate(element => element.textContent.trim().match(/\d+\.\d+/)[0], dollarElement);

                console.log("nAVAX Value:", nAVAXValue);
                console.log("Dollar Value:", dollarValue);

                if (!isNaN(dollarValue) && !isNaN(nAVAXValue)) {
                    db.run(`INSERT INTO gas_prices (dollarPrice,nAVAXPrice) VALUES (?,?)`, [dollarValue,nAVAXValue], (err) => {
                        if (err) {
                            console.error('Error inserting gas price into database:', err.message);
                        } else {
                            console.log('Gas price scraped and stored successfully.');
                        }
                    });
                } else {
                    console.error('Invalid gas price value:', medGasPriceText);
                }

            } 
        } else {
            console.log("Parent's parent element not found.");
        }

        await browser.close();
    } catch (error) {
        console.error("Error:", error);
    }
}


//Schedule the task to run every half hour
scheduleJob('0,30 * * * *', () => {
    scrapeAndStoreGasPrice();
});
