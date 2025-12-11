const mongoose = require('mongoose')
const consta = require('../config/constantes')
require('dotenv').config()

// Validate required environment variables
const validateEnvVars = () => {
    const required = ['USR_NAME', 'PSS_WORD', 'CLU'];
    const missing = required.filter(key => !process.env[key] || process.env[key].trim() === '');
    
    if (missing.length > 0) {
        console.error('❌ Missing required environment variables:', missing.join(', '));
        console.error('Please ensure these are set in your .env file or environment variables');
        return false;
    }
    return true;
}

const conectionManager = (req, db) => {

    try {
        // Validate environment variables before attempting connection
        if (!validateEnvVars()) {
            console.error('Cannot create MongoDB connection: missing environment variables');
            return null;
        }

        const dbname = db ? db : `DB_Analytic_Bet`;
        const options = {
            useUnifiedTopology: true,
            useNewUrlParser: true
        }
        
        // Trim CLU to handle any whitespace issues
        const cluster = process.env.CLU.trim();
        const username = process.env.USR_NAME.trim();
        const password = process.env.PSS_WORD.trim();
        
        const connectionString = `mongodb+srv://${username}:${password}@${cluster}.mongodb.net/${dbname}?retryWrites=true&w=majority`;
        
        console.log(`Attempting to connect to MongoDB cluster: ${cluster}.mongodb.net`);
        const conn = mongoose.createConnection(connectionString, options)
        conn.on('open', () => console.log('✅ DB connection open'))
        conn.on('error', err => console.log(`❌ DB connection error : ${err.message}`, err))
        conn.on('close', () => console.log('⚠️ DB connection closed'))
        return conn;

    } catch (error) {
        console.error('❌ Error creating MongoDB connection:', error);
        return null;
    }
}

const getModel = (conn, schemaName, req) => {
    return conn.model(schemaName, require(`../models/${schemaName}`), schemaName);
}

const dbConnection = async(req, res, next) => {
    try {
        // Validate environment variables before attempting connection
        if (!validateEnvVars()) {
            throw new Error('Missing required MongoDB environment variables (USR_NAME, PSS_WORD, CLU)');
        }

        const dbname = `FE_${req.headers.grupocompania}_${req.headers.companiaid}`;
        console.log(`Connecting to database: ${dbname}`);
        
        // Trim environment variables to handle whitespace
        const cluster = process.env.CLU.trim();
        const username = process.env.USR_NAME.trim();
        const password = process.env.PSS_WORD.trim();
        
        const connectionString = `mongodb+srv://${username}:${password}@${cluster}.mongodb.net/${dbname}?retryWrites=true&w=majority`;
        
        await mongoose.connect(connectionString, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Base de datos online');
        next();
    } catch (error) {
        console.error('❌ Database connection error:', error.message);
        throw new Error('Error a la hora de iniciar la base de datos: ' + error.message);
    }
}

module.exports = {
    dbConnection,
    conectionManager,
    getModel
}