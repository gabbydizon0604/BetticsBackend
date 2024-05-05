const errorMiddleware = require('../middleware/errors')
const { getModel, conectionManager } = require('../config/connection');
const consta = require('../config/constantes')
const bcryptjs = require('bcryptjs')
const { replaceAll, reverse } = require('../shared/util')
let cacheProvider = require('../shared/cache-provider')

const options = {
    page: 1,
    limit: 10,
    select: '_id nombre tipoApuesta id_apuesta_combinada id_apuesta_simple liga equipoLocal equipoVisitante pais mercadoApuesta opcionApuesta valorOpcionApuesta cuotaSimple cuotaCombinada fechaJuego'
}

exports.getIdData = async(req, res, next) => {
    const conn = conectionManager(req);
    try {
        const Recomendaciones = getModel(conn, consta.SchemaName.recomendaciones);
        const data = await Recomendaciones.findById(req.params.pId).select('_id nombre tipoApuesta liga equipoLocal equipoVisitante pais mercadoApuesta opcionApuesta valorOpcionApuesta cuotaSimple cuotaCombinada fechaRegistro fechaJuego');
        if (data == null) return res.sendStatus(404);
        res.json(data)
    } catch (err) {
        return errorMiddleware(err, req, res, next);
    } finally { conn.close(); }
}

exports.getCriterio = async(req, res, next) => {
    const conn = conectionManager(req);
    try {

        const PrioridadPartidos = getModel(conn, consta.SchemaName.prioridadPartidos);

        const cacheKey = consta.cacheController.prioridadPartidos.byGetCriterio;
        const prioridadPartidosCache = await cacheProvider.instance().get(cacheKey);
        if (prioridadPartidosCache)
            return res.send({
                resStatus: 'ok',
                resResult: prioridadPartidosCache
            })

        if (req.query.pageNumber != undefined) options.page = req.query.pageNumber;
        if (req.query.pageSize != undefined) options.limit = req.query.pageSize;

        const data = await PrioridadPartidos.find({
            prioridad: "1",
            activo: true
        }).select("_id competition_id id homeID awayID season status game_week home_name away_name date_unix home_image away_image probabilidad mercado pais_imagen prioridad liga")
 
        cacheProvider.instance().set(cacheKey, data, 7200); // 2 horas de cache

        return res.send({
                resStatus: 'ok',
                resResult: data
            })
            
    } catch (err) {
        console.log(err)
        return errorMiddleware(err, req, res, next);
    } finally { conn.close(); }
}

exports.insertDataMasivo = async(req, res, next) => {
    const conn = conectionManager(req);
    try {
        const PrioridadPartidos = getModel(conn, consta.SchemaName.prioridadPartidos);
        const data = req.body;

        await PrioridadPartidos.deleteMany({});

        const result = await PrioridadPartidos.insertMany(data)

        return res.json(result)
    } catch (err) {
        return errorMiddleware(err, req, res, next);
    } finally { conn.close(); }
}