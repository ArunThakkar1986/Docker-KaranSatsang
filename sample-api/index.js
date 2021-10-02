const express = require('express')
const { Sequelize, DataTypes } = require('sequelize');
const helmet = require('helmet')
const compression = require('compression')
const rateLimit = require("express-rate-limit");



const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect:'postgres',
    dialectOptions: {
        ssl: {
            require:true,
            rejectUnauthorized:false
        }
    }
});

const NewReleaseData = sequelize.define('new-releases', {
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
app.use(limiter);


app.get('/new-releases', async (req, res) => {
    const allReleaseList = await NewReleaseData.findAll()
    res.status(200).send(allReleaseList);
    return
});

app.post('/new-releases', async (req, res) => {
    let data = req.body;
    const newReleaseData = await NewReleaseData.create(data)
    res.status(201).send(newReleaseData);
    return;
});

app.listen({port:8080}, () => {
    try{
        sequelize.authenticate();
        console.log("Connected to Database");
        sequelize.sync({ alter:true });
        console.log('Sync to database');
    } catch (error) {
        console.log('Could not connect to the database', error);
    }
    console.log('Server is running')
});

