# Build a Content Scraper
В репозитории содержится пример реализации HTML-скраппера на Node.JS для сайта http://shirts4mike.com/shirts.php. После запуска приложения отправляется запрос на указанный адрес, получается HTML контент, парсится при помощи скраппера и записывается в CSV файл. Если приложение запустится более одного раза в день, то данные в CSV файле будут обновлены.

Для проекта использованы два NPM пакета:
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

