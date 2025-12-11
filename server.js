require('dotenv').config()

// Validate environment variables on startup
const requiredEnvVars = ['USR_NAME', 'PSS_WORD', 'CLU'];
const missingEnvVars = requiredEnvVars.filter(key => {
    const value = process.env[key];
    return !value || (typeof value === 'string' && value.trim() === '');
});

if (missingEnvVars.length > 0) {
    console.error('❌ CRITICAL: Missing required environment variables:', missingEnvVars.join(', '));
    console.error('The application cannot start without these variables.');
    console.error('Please set them in your .env file or environment configuration (Render, etc.)');
    console.error('');
    console.error('Required variables:');
    console.error('  - USR_NAME: MongoDB username');
    console.error('  - PSS_WORD: MongoDB password');
    console.error('  - CLU: MongoDB cluster name (e.g., "serverfe.qz1jw")');
    console.error('');
    console.error('Current status:', {
        USR_NAME: process.env.USR_NAME ? '✅ SET' : '❌ MISSING',
        PSS_WORD: process.env.PSS_WORD ? '✅ SET' : '❌ MISSING',
        CLU: process.env.CLU || '❌ MISSING'
    });
    process.exit(1);
}

const express = require('express')
const cors = require('cors')
const app = express()

const port = process.env.PORT
const errorMiddleware = require('./app/middleware/errors')
const loginRouters = require('./app/routes/login')
const usuarioRouters = require('./app/routes/usuario')
const recomendacionesRouters = require('./app/routes/recomendaciones')
const webhookRouters = require('./app/routes/webhook')
const culqiRouters = require('./app/routes/culqi')
const eventosLigaRouters = require('./app/routes/eventosLiga')
const tableroPosicionesRouters = require('./app/routes/tableroPosiciones')
const emailRouters = require('./app/routes/email')
const forgorPasswordRouters = require('./app/routes/forgorPassword')
const prioridadPartidosRouters = require('./app/routes/prioridadPartidos')
const resultadosRouters = require('./app/routes/resultados')
const partidosJugarRouters = require('./app/routes/partidosJugar')
const paypalRouters = require('./app/routes/paypal')
const chatbotRouters = require('./app/routes/chatbot')
const chatbotAdminRouters = require('./app/routes/chatbot-admin')
const chatbotDialogflowRouters = require('./app/routes/chatbot-dialogflow')
const chatbotConversationRouters = require('./app/routes/chatbot-conversation')
    //const logErroresRouters = require('./app/routes/logErrores')
let cacheProvider = require('./app/shared/cache-provider')

class Server {

    constructor() {
        this.app = express();
        this.port = process.env.PORT || 3000;

        // Conectar a base de datos
        // this.conectarDB();

        // Middlewares
        this.middlewares();

        // Rutas de mi aplicación
        this.routes();

        //
        this.app.use(
            express.json({
                limit: '20mb'
            })
        )
        this.app.use(
            express.urlencoded({
                limit: '20mb',
                extended: true
            })
        )
    }

    middlewares() {

        // CORS
        this.app.use(cors());
        this.app.use(
            express.json({
                limit: '20mb'
            })
        )
        this.app.use(
            express.urlencoded({
                limit: '20mb',
                extended: true
            })
        )

        // Lectura y parseo del body
        // this.app.use(express.json());

        // Directorio Público
        // this.app.use(express.static('public'));
    }

    routes() {

        // this.app.use(this.authPath, require('../routes/auth'));
        this.app.use(loginRouters, errorMiddleware)
        this.app.use(usuarioRouters, errorMiddleware)
        this.app.use(culqiRouters, errorMiddleware)
        this.app.use(recomendacionesRouters, errorMiddleware)
        this.app.use(webhookRouters, errorMiddleware)
        this.app.use(eventosLigaRouters, errorMiddleware)
        this.app.use(tableroPosicionesRouters, errorMiddleware)
        this.app.use(emailRouters, errorMiddleware)
        this.app.use(forgorPasswordRouters, errorMiddleware)
        this.app.use(prioridadPartidosRouters, errorMiddleware)
        this.app.use(resultadosRouters, errorMiddleware)
        this.app.use(partidosJugarRouters, errorMiddleware)
        this.app.use(paypalRouters, errorMiddleware)
        this.app.use(chatbotRouters, errorMiddleware)
        this.app.use(chatbotAdminRouters, errorMiddleware)
        this.app.use(chatbotDialogflowRouters, errorMiddleware)
        this.app.use(chatbotConversationRouters, errorMiddleware)
        
    }

    listen() {
        this.app.listen(this.port, () => {
            console.log('Servidor corriendo en puerto', this.port);
        });
    }

}

const server = new Server();
cacheProvider.start(function(err) {
    if (err) console.error(err)
})
server.listen();