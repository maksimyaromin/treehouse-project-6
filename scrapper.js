const axios = require("axios");
const scrapper = require("ebri-scrap");
const fs = require("fs");
const json2csv = require("json2csv").parse;

/* Функция логирования ошибок. Выводит сообщение об ошибке на консоль, а так же
    записывает ошибку в файл scraper-error.log проставляя время возникновения ошибки. 
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
                "Невозможно произвести запись в файл с логами: " + err.message);
        }
    });
};

/* Используя npm пакет ebri-scrap распарсить полученный html по схеме,
    предложенной в options. К сожалению, я нигде не нашел информацию что этот
    пакет скачали более 1000 раз, но почему это должно быть показателем крутизны?
    Это очень новый пакет, и возможно через месяц у него будет 1000000 загрузок.
    Главное, что это очень крутой пакет
*/
const parseContent = ({ content, options }) => {
    const items = scrapper.parse(content, options);
    return items;
};

/* Я использую обертку axios, основанную на том же модуле node http.
    Данная функция создает запрос по запрошенному url.
*/
const getContentRequest = url => {
    return axios.get(url);
};

// Глобальные переменные
const dataPath = __dirname + "\\data";
const domainName = "http://shirts4mike.com/";
const list = [];
// Класс, описывающий единицу продукта
class Product {
    constructor({ id, url, image }) {
        this.id = +id,
        this.url = url;
        this.image = image;

        this.title = "";
        this.price = 0;
        this.time = null;
    }
    /* Функция возвращает промис, основанный на http запросе за дополнительной
        информацией о товаре. По результатам запроса к товару дописываются название, цена
        и дата получения информации.
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

/* Используя npm пакет json2csv преобразовать полученные результаты в csv и сохранить в файл
    на текущую дату.
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

/* Проверить, существует ли директория для csv файлов. Если не существует, то создать.
*/
if(!fs.existsSync(dataPath)) {
    fs.mkdirSync(dataPath);
}

/* Начало работы приложения. Отправить основной запрос, распарсить его, создать 
    список объектов типа Product. 
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
        // Запустить запросы за дополнительными данными для всех продуктов.
        const details = list.map(product => product.detail());
        // Промис, выполняющийся по завершению всех запросов
        Promise.all(details)
            .then(() => {
                // Здесь мы можем быть уверены что все запросы завершены. Можно записать CSV
                saveAsCsv();
            })
            .catch(err => {
                error(err.message);
            });
    })
    .catch(err => {
        error(`${err.message}. Cannot connect to ${domainName} or parse response.`);
    });