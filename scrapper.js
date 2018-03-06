const axios = require("axios");
const scrapper = require("ebri-scrap");
const fs = require("fs");
const json2csv = require("json2csv").parse;

/* The function of error logging. Displays an error message to the console, and also writes an error to the scraper-error.log file, 
    stating the time of the error occurrence.     
*/
const error = (err) => {
    const message = typeof err === "string" 
        ? err : err.message;
    const timeStamp = (new Date()).toString();
    const log = `[${timeStamp}] ${message}`;
    console.error(message);
    fs.appendFile(__dirname + "\\scraper-error.log", log + "\n", err => {
        if (err) {
            console.error(
                "Unable to write to log file: " + err.message);
        }
    });
};

/* Using the npm package ebri-scrap, parse the resulting html according to the scheme proposed in the options. 
    Unfortunately, I haven't found any information that this package was downloaded more than 1000 times, 
	but why should this be an indicator of steepness? 
	This is a very new package, and maybe in a month it will have 1,000,000 downloads. 
	The main thing is that this is a really cool package	
*/
const parseContent = ({ content, options }) => {
    const items = scrapper.parse(content, options);
    return items;
};

/* I use an axios wrapper, based on the node http module. 
    This function creates a query on the requested url.
*/
const getContentRequest = url => {
    return axios.get(url);
};

// Global variables
const dataPath = __dirname + "\\data";
const domainName = "http://shirts4mike.com/";
const list = [];
// Class,describing a product unit
class Product {
    constructor({ id, url, image }) {
        this.id = +id,
        this.url = url;
        this.image = image;

        this.title = "";
        this.price = 0;
        this.time = null;
    }
    /* The function returns a promise based on the http request for product details. 
	    As a result of the request name, price and date of receipt 
		of information are added for the goods.		
    */
    detail() {
        return new Promise((resolve, reject) => {
            getContentRequest(this.url)
                .then(response => {
                    const detail = parseContent({
                        content: response.data,
                        options: {
                            price: ".shirt-details .price | format:number",
                            title: ".shirt-details h1 | format:one-line-string"
                        }
                    });
                    this.price = detail.price;
                    this.title = detail.title.replace(/^\$\d+\s/g, "");
                    this.time = new Date();
                    resolve();
                })
                .catch(err => {
                    reject(err);
                });
        });
    }
};

/* Using the npm package json2csv convert the results into csv 
    and save to a current date  file  
*/
const saveAsCsv = () => {
    const csv = json2csv(list, {
        fields: [ 
            {
                label: "Product ID",
                value: "id"
            },
            {
                label: "Title",
                value: "title"
            },
            {
                label: "Price",
                value: row => `$${row.price}`
            },
            {
                label: "ImageURL",
                value: "image"
            },
            {
                label: "URL",
                value: "url"
            },
            {
                label: "Time",
                value: row => row.time.toISOString()
            }
        ]
    });
    const now = new Date();
    fs.writeFile(
        `${dataPath}\\${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}.csv`, csv, 'utf8',
        err => {
            if(err) {
                error(err.message);
            }
        }
    );
};

/* Check if there is a directory for csv files. If it does not exist, 
    then create.    
*/
if(!fs.existsSync(dataPath)) {
    fs.mkdirSync(dataPath);
}

/* Start the application. Send the main request, parse it, 
    create a list of objects with type Product.    
*/
getContentRequest(`${domainName}shirts.php`)
    .then(response => {
        const items = parseContent({
            content: response.data,
            options: [{
                containerSelector: ".products",
                itemSelector: "li a",
                data: {
                    id: "a | extract:prop:href | format:regex:id=(.*):$1",
                    url: `a | extract:prop:href | format:url:"${domainName}"`,
                    image: `a img | extract:prop:src | format:url:"${domainName}"`
                }
            }]
        });
        for (let item of items) {
            list.push(new Product(item));
        }
        // Run queries for additional data for all products.
        const details = list.map(product => product.detail());
        // Promise executed after all requests are completed
        Promise.all(details)
            .then(() => {
                // Here we can be sure that all requests are completed. We can write CSV
                saveAsCsv();
            })
            .catch(err => {
                error(err.message);
            });
    })
    .catch(err => {
        error(`${err.message}. Cannot connect to ${domainName} or parse response.`);
    });