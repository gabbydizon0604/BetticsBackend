require('dotenv').config()

// Validate environment variables on startup
const requiredEnvVars = ['USR_NAME', 'PSS_WORD', 'CLU'];
const missingEnvVars = requiredEnvVars.filter(key => {
    const value = process.env[key];
    return !value || (typeof value === 'string' && value.trim() === '');
});

if (missingEnvVars.length > 0) {
    console.error('');
    console.error('╔═══════════════════════════════════════════════════════════════╗');
    console.error('║  ❌ CRITICAL: Missing Required Environment Variables          ║');
    console.error('╚═══════════════════════════════════════════════════════════════╝');
    console.error('');
    console.error('Missing variables:', missingEnvVars.join(', '));
    console.error('');
    
    // Detect if running on Render
    const isRender = process.env.RENDER || process.env.RENDER_EXTERNAL_HOSTNAME;
    
    if (isRender) {
        console.error('📍 DETECTED: You are running on Render');
        console.error('');
        console.error('🔧 TO FIX - Follow these steps:');
        console.error('');
        console.error('1. Go to: https://dashboard.render.com/');
        console.error('2. Select your backend service');
        console.error('3. Click "Environment" in the left sidebar');
        console.error('4. Click "Add Environment Variable" for each:');
        console.error('');
        console.error('   Variable Name: USR_NAME');
        console.error('   Value: [Your MongoDB username]');
        console.error('');
        console.error('   Variable Name: PSS_WORD');
        console.error('   Value: [Your MongoDB password]');
        console.error('');
        console.error('   Variable Name: CLU');
        console.error('   Value: [Your cluster name, e.g., "serverfe.qz1jw"]');
        console.error('   ⚠️  IMPORTANT: Use ONLY the cluster name, NOT ".mongodb.net"');
        console.error('');
        console.error('5. Click "Save Changes"');
        console.error('6. Render will automatically redeploy');
        console.error('');
    } else {
        console.error('📍 You are running locally');
        console.error('');
        console.error('🔧 TO FIX - Create a .env file in the backend directory:');
        console.error('');
        console.error('USR_NAME=your_mongodb_username');
        console.error('PSS_WORD=your_mongodb_password');
        console.error('CLU=your_cluster_name');
        console.error('');
    }
    
    console.error('📋 Required variables:');
    console.error('  • USR_NAME: MongoDB username');
    console.error('  • PSS_WORD: MongoDB password');
    console.error('  • CLU: MongoDB cluster name (e.g., "serverfe.qz1jw")');
    console.error('');
    console.error('📊 Current status:');
    console.error('  USR_NAME:', process.env.USR_NAME ? '✅ SET' : '❌ MISSING');
    console.error('  PSS_WORD:', process.env.PSS_WORD ? '✅ SET' : '❌ MISSING');
    console.error('  CLU:', process.env.CLU || '❌ MISSING');
    console.error('');
    console.error('📖 For detailed instructions, see: RENDER_SETUP.md');
    console.error('');
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