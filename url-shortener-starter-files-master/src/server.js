require('dotenv').config();

const nanoid = require('nanoid');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const dns = require('dns');


const databaseUrl = "mongodb://localhost:27017/shortener" //process.env.DATABASE;

var MongoClient = require('mongodb').MongoClient;
// var url = "mongodb://localhost:27017/mydb";

// MongoClient.connect(url, function (err, db) {
//     if (err) throw err;
//     console.log("Database created!");
//     db.close();
// });

const app = express();
app.use(express.static(path.join(__dirname, 'public')))

MongoClient.connect(databaseUrl, {
        useNewUrlParser: true
    })
    .then(MongoClient => {
        app.locals.db = MongoClient.db('shortener');

    })
    .catch(() => console.error('Failed again to connect to the database'));

// Use connect method to connect to the server
// MongoClient.connect(databaseUrl, function (err, db) {
//     assert.equal(null, err);
//     console.log("Connected successfully to server");

//     db.close();
// });


const shortenURL = (db, url) => {
    const shortenedURLs = db.collection('shortenedURLs');

    return shortenedURLs.findOneAndUpdate({
        original_url: url
    }, {
        $setOnInsert: {
            original_url: url,
            short_id: nanoid(7),
        },
    }, {
        returnOriginal: false, 
        upsert: true,
    });
};
app.use(bodyParser.json());

app.get('/', (req, res) => {
    const htmlPath = path.join(__dirname, 'public', 'index.html');
    res.sendFile(htmlPath);
});

app.set('port', process.env.PORT || 4200);
const server = app.listen(app.get('port'), () => {
    console.log(`Express running → PORT ${server.address().port}`);
});

app.post('/new', (req, res) => {
    let originalUrl;
    try {
        originalUrl = new URL(req.body.url);
    } catch (err) {
        return res.status(400).send({
            error: 'invalid URL'
        });
    }

    dns.lookup(originalUrl.hostname, (err) => {
        if (err) {
            return res.status(404).send({
                error: 'Address not found'
            });
        };
    });
});