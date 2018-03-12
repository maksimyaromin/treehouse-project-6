# Build a Content Scraper
The repository contains an example of implementing an HTML scrapper based on Node.JS for  http://shirts4mike.com/shirts.php. 
After starting the application a request is sent to the specified address, where  HTML content is obtained and is parsed by scrapper and recorded in the CSV file.
If the application is started more than once per day, the data in the CSV file will be updated.

Two NPM packages were used for the project:
1. ~~[ebri-scrap](https://www.npmjs.com/package/ebri-scrap)~~ [cheerio](https://www.npmjs.com/package/cheerio)
2. [json2csv](https://www.npmjs.com/package/json2csv)

To run the project use the following commands:
```shell
    npm install
    npm start
```
or
```shell
    node scrapper.js
```

#### Notes
*I replace ebri-scrap package on cheerio packege. Cheerio has almost 7kk downloads in the last month. But the number of downloads doesn't measure the steepness of the package. To understand this just compare two versions of my code. Oh, well, of course you'll have no time, you must teach students...*

### I hope you will enjoy it. Max Eremin