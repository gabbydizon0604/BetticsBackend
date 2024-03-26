const bcryptjs = require('bcryptjs')
const { generarJWT } = require('../shared/generar-jwt')
const consta = require('../config/constantes')
const { getModel, conectionManager } = require('../config/connection')
const { obtenerCompania, ordenarMenu } = require('../logic/accesos')

exports.getLogin = async(req, res, next) => {
    const conn = conectionManager(req);
    try {
        const { correoElectronico, password } = req.body;
        const Usuario = getModel(conn, consta.SchemaName.usuario);
        // Verificar si el email existe
        let usuario = await Usuario.findOne({ correoElectronico }).select('_id foto nombres apellidos correoElectronico tipoCliente activo informacion password clienteCulquiId tarjetaCulquiId suscripcionCulquiId billeteraMovilPagadoId billeteraMovilPagadoFecha tipoLicencia');
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
        if (!validPassword) {
            return res.status(400).json({
                message: 'La contraseña ingresada es incorrecta.'
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
            tipoLicencia: usuario.tipoLicencia
        }
        const [token] = await Promise.all([
            generarJWT(dataJwt),
        ])

        res.json({
            token,
            usuario: {
                ...dataJwt,
                foto: usuario.foto
            }
        })
    } catch (err) {

        console.log(err)
            //return errorMiddleware(err, req, res, next);
    } finally { conn.close(); }
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