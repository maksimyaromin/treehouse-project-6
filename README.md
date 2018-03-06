# Build a Content Scraper
The repository contains an example of implementing an HTML scrapper based on Node.JS for  http://shirts4mike.com/shirts.php. 
After starting the application a request is sent to the specified address, where  HTML content is obtained and is parsed by scrapper and recorded in the CSV file.
If the application is started more than once per day, the data in the CSV file will be updated.

Two NPM packages were used for the project:
1. [ebri-scrap](https://www.npmjs.com/package/ebri-scrap)
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

### I hope you will enjoy it. Max Eremin