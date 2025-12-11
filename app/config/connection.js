const mongoose = require('mongoose')
const consta = require('../config/constantes')
require('dotenv').config()

const conectionManager = (req, db) => {

    try {
        const dbname = db ? db : `DB_Analytic_Bet`;
        const options = {
            useUnifiedTopology: true,
            useNewUrlParser: true
        }
        const conn = mongoose.createConnection(`mongodb+srv://${process.env.USR_NAME}:${process.env.PSS_WORD}@${process.env.CLU}.mongodb.net/${dbname}?retryWrites=true&w=majority`, options)
        conn.on('open', () => console.log('DB connection open'))
        conn.on('error', err => console.log(`DB connection error : ${err.message}`, err))
        conn.on('close', () => console.log('DB connection closed'))
        return conn;

    } catch (error) {
        console.log(error);
        return null;
    }
}

const getModel = (conn, schemaName, req) => {
    return conn.model(schemaName, require(`../models/${schemaName}`), schemaName);
}

const dbConnection = async(req, res, next) => {
    try {
        const dbname = `FE_${req.headers.grupocompania}_${req.headers.companiaid}`;
        console.log(dbname);
        await mongoose.connect(`mongodb+srv://${process.env.USR_NAME}:${process.env.PSS_WORD}@${process.env.CLU}.mongodb.net/${dbname}`, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Base de datos online');
        next();
    } catch (error) {
        console.log(error);
        throw new Error('Error a la hora de iniciar la base de datos');
    }
}

module.exports = {
    dbConnection,
    conectionManager,
    getModel
}