const bcryptjs = require('bcryptjs')
const { generarJWT } = require('../shared/generar-jwt')
const consta = require('../config/constantes')
const { getModel, conectionManager } = require('../config/connection')
const { obtenerCompania, ordenarMenu } = require('../logic/accesos')

exports.getLogin = async(req, res, next) => {
    const conn = conectionManager(req);
    
    // Validate connection
    if (!conn) {
        return res.status(500).json({
            message: 'Error de conexión a la base de datos. Por favor, contacte al administrador.'
        });
    }
    
    try {
        const { correoElectronico, password } = req.body;
        
        // Validate request body - ModelState-like validation
        const validationErrors = {};
        let isValid = true;
        
        // Validate correoElectronico
        if (!correoElectronico) {
            validationErrors.correoElectronico = ['El correo electrónico es requerido.'];
            isValid = false;
        } else if (typeof correoElectronico !== 'string' || correoElectronico.trim().length === 0) {
            validationErrors.correoElectronico = ['El correo electrónico no puede estar vacío.'];
            isValid = false;
        } else {
            // Basic email format validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const trimmedEmail = correoElectronico.trim().toLowerCase();
            if (!emailRegex.test(trimmedEmail)) {
                validationErrors.correoElectronico = ['El formato del correo electrónico no es válido.'];
                isValid = false;
            }
        }
        
        // Validate password
        if (!password) {
            validationErrors.password = ['La contraseña es requerida.'];
            isValid = false;
        } else if (typeof password !== 'string' || password.length === 0) {
            validationErrors.password = ['La contraseña no puede estar vacía.'];
            isValid = false;
        }
        
        // If validation failed, log errors and return BadRequest with details
        if (!isValid) {
            // Log validation errors before returning BadRequest
            console.error('========================================');
            console.error('[LoginController] ===== VALIDATION ERRORS =====');
            console.error('[LoginController] Timestamp:', new Date().toISOString());
            console.error('[LoginController] Request method:', req.method);
            console.error('[LoginController] Request URL:', req.originalUrl || req.url);
            console.error('[LoginController] Request body:', JSON.stringify(req.body, null, 2));
            console.error('[LoginController] Validation errors:', JSON.stringify(validationErrors, null, 2));
            console.error('[LoginController] Request IP:', req.ip || req.connection?.remoteAddress || 'unknown');
            console.error('[LoginController] Request User-Agent:', req.headers['user-agent'] || 'unknown');
            console.error('[LoginController] ========================================');
            
            return res.status(400).json({
                errors: validationErrors,
                message: 'Error de validación. Por favor, verifique los campos ingresados.',
                type: 'error validación',
                title: 'Validación',
                status: 400,
                traceId: `login-${Date.now()}`
            });
        }
        
        // Normalize email for database query (trim and lowercase)
        const normalizedEmail = correoElectronico.trim().toLowerCase();
        
        const Usuario = getModel(conn, consta.SchemaName.usuario);
        const registroRecurrenciaModel = getModel(conn, consta.SchemaName.registroRecurrencia);
        // Verificar si el email existe (using normalized email)
        const [usuario, registroRecurrencia] = await Promise.all([
            Usuario.findOne({ correoElectronico: normalizedEmail }).select('_id foto nombres apellidos correoElectronico tipoCliente activo informacion password clienteCulquiId tarjetaCulquiId suscripcionCulquiId billeteraMovilPagadoId billeteraMovilPagadoFecha tipoLicencia suscripcionPaypalId suscription_create_time'),
            getRegistroRecurrenciaLogin(conn, res, next, registroRecurrenciaModel, { correoElectronico: normalizedEmail })
        ])

        if (!usuario) {
            return res.status(400).json({
                message: 'El usuario ingresado no existe.'
            });
        }
        // SI el usuario está activo
        if (!usuario.activo) {
            return res.status(400).json({
                message: 'El usuario se encuentra inactivo.'
            });
        }
        // Verificar la contraseña
        const validPassword = bcryptjs.compareSync(password, usuario.password);
        console.log(validPassword);
        if (!validPassword) {
            return res.status(400).json({
                message: 'La contraseña ingresada es .'
            });
        }
        // Obtener valores

        const dataJwt = {
            _id: usuario._id,
            nombres: usuario.nombres,
            apellidos: usuario.apellidos,
            tipoCliente: usuario.tipoCliente,
            correoElectronico: usuario.correoElectronico,
            clienteCulquiId: usuario.clienteCulquiId,
            suscripcionCulquiId: usuario.suscripcionCulquiId,
            tarjetaCulquiId: usuario.tarjetaCulquiId,
            billeteraMovilPagadoId: usuario.billeteraMovilPagadoId,
            tipoLicencia: usuario.tipoLicencia,
            suscripcionPaypalId: usuario.suscripcionPaypalId,
            suscription_create_time: usuario.suscription_create_time
        }

        const dataRecurrencia = {
            correoElectronico: usuario.correoElectronico,
            nombreUsuario: usuario.nombres + " "+ usuario.apellidos,
            cantidadRecurrencia: registroRecurrencia?.cantidadRecurrencia || 0 
        }

        const [token, resultRegistroRecurrencia] = await Promise.all([
            generarJWT(dataJwt),
            registroRecurrenciaLogin(req, res, next, registroRecurrenciaModel, dataRecurrencia)
        ])

        res.json({
            token,
            usuario: {
                ...dataJwt,
                foto: usuario.foto
            }
        })
    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({
            message: 'Error al procesar el login. Por favor, intente nuevamente.'
        });
    } finally { 
        if (conn) conn.close(); 
    }
}

const controlarMensualidadPorPagoUnico = async(req, res, next, UsuarioModel, usuario) => {
    let dateNow = new Date();
    console.log(dateNow)
    if (usuario.billeteraMovilPagadoFecha < dateNow) {

        await UsuarioModel.updateOne({ _id: usuario.userId }, {
            $set: {
                billeteraMovilPagadoId: null,
                billeteraMovilPagadoFecha: null
            }
        }, { new: true });
        const user = await UsuarioModel.findById({ _id: usuario.userId }).select('_id foto nombres apellidos correoElectronico tipoCliente activo informacion password clienteCulquiId tarjetaCulquiId suscripcionCulquiId billeteraMovilPagadoId billeteraMovilPagadoFecha');
        return user;
    } else {
        return usuario;
    }
}

const registroRecurrenciaLogin = async(req, res, next, registroRecurrenciaModel, data) => {

    try {
        
        let dateNow = new Date();
        const year = dateNow.getFullYear().toString();
        const month = dateNow.getMonth().toString();
        console.log("data")
        console.log(data)
        let resultado = await registroRecurrenciaModel.updateOne(
            { 
                correoElectronico: data.correoElectronico,
                aniomes: year + month
            }, {
            $set: {
                aniomes: year + month,
                activo: true,
                correoElectronico: data.correoElectronico,
                nombreUsuario: data.nombreUsuario,
                cantidadRecurrencia: data.cantidadRecurrencia + 1
            }
        }, {upsert: true, setDefaultsOnInsert: true});

        console.log("resultado")
        console.log(resultado)
       
    } catch (error) {
        console.log(error);
    }
}

const getRegistroRecurrenciaLogin = async(req, res, next, registroRecurrenciaModel, data) => {

    try {
        
        let dateNow = new Date();
        const year = dateNow.getFullYear().toString();
        const month = dateNow.getMonth().toString();

        const registroRecurrencia = await registroRecurrenciaModel.findOne({ 
            correoElectronico: data.correoElectronico,
            aniomes: year + month
        }).select('cantidadRecurrencia');

        return registroRecurrencia;
       
    } catch (error) {
        console.log();
    }
}