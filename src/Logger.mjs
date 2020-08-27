import winston from 'winston'
import expressWinston from 'express-winston'
import requestIP from 'request-ip'

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.simple(),
    transports: [
        new winston.transports.Console({stderrLevels: ['warn', 'error']}),
        new winston.transports.File({ filename: `${process.env.LOG_PATH || '.'}/error.log`, level: 'error' }),
        new winston.transports.File({ filename: `${process.env.LOG_PATH || '.'}/out.log`, level: process.env.LOG_LEVEL || 'info' }),
    ]
});

function error(msg, err){
    logger.error(msg, err)
}
function warn(msg){
    logger.warn(msg)
}
function info(msg){
    logger.info(msg)
}
function debug(msg){
    logger.debug(msg)
}

const expressLogger = expressWinston.logger({
    transports: [
        new winston.transports.File({ filename: `${process.env.LOG_PATH || '.'}/net.log` }),
    ],
    meta: false,
    format: winston.format.simple(),
    msg: (req, res) => `${requestIP.getClientIp(req)} - ${req.method} ${req.url} - ${res.statusCode}`,
    metaField: null
})

export { debug, info, error, warn, expressLogger }
