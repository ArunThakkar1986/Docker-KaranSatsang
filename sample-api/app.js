const express = require('express')
const { Sequelize, DataTypes } = require('sequelize');
const helmet = require('helmet')
const compression = require('compression')
const rateLimit = require("express-rate-limit");
const crypto = require('crypto');

const HMAC_KEY = process.env.HMAC_KEY || 'virus';
const API_KEY = process.env.API_KEY || '12345';

const nodeEnv = process.env.NODE_ENV

/* Following needs for Google Could - Found on Google Cloude sql docs postgres - connecting from Cloud Run
const dbScoketPath = process.env.DB_SOCKET_PATH || 'cloudsql';

const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const database = process.env.DB_NAME
const host = `${dbScoketPath}/`

*/

const sequelize = nodeEnv === 'test' ?
new Sequelize('sqlite:memory:') :
//new Sequelize(user, password, database { - for Google Cloud and can delete ssl and add host param
new Sequelize(process.env.DATABASE_URL, { 
    dialect:'postgres',
    //host:host
    // dialectOptions: { // Hide this when you're running from server on Https
    //     ssl: {
    //         require:true,
    //         rejectUnauthorized:false
    //     }
    // }
});

const NewReleaseData = sequelize.define('newReleases', {
    albumName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    albumURL: {
        type: DataTypes.STRING,
        allowNull: false
    },
    publishedDate: {
        type: DataTypes.STRING,
        allowNull: false
    }
})

const limiter = rateLimit({
    windowMs: 1*60*1000, // 1 minutes
    max:10 //limit each IP to 10 requests per windowMs
});


const app = express();
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(limiter); // all methods below applies limit.. 10/minute GET and 10/minute POST

app.use((req, res, next) => {
    let key = req.query.key;
    if(!key || key !== '12345') {
        res.status(403).send()
        return;
    }
    next();
})
/**
 * app.get('/new-releases', async (req, res) => {
    const allReleaseList = await NewReleaseData.findAll()
    res.status(200).send(allReleaseList);
    return
});
 * 
 */
app.get('/new-releases', async (req, res) => {
    let limit = req.query.limit || 5 ; 
    let offset = req.query.offset || 0;

    const allReleaseList = await NewReleaseData.findAll({limit, offset})
    res.status(200).send(allReleaseList);
    return
});

app.post('/new-releases', async (req, res) => {
    let data = req.body;
    const newReleaseData = await NewReleaseData.create(data)
    res.status(201).send(newReleaseData);
    return;
});

//Following Exporting to other file
// app.listen({port:8080}, () => {
//     try{
//         sequelize.authenticate();
//         console.log("Connected to Database");
//         sequelize.sync({ alter:true });
//         console.log('Sync to database');
//     } catch (error) {
//         console.log('Could not connect to the database', error);
//     }
//     console.log('Server is running')
// });


module.exports = { app, sequelize };