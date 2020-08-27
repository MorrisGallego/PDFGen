import express from 'express'
import * as Logger from './Logger.mjs'

function handler(generator, extractor = req => req.body) {
    return async (req, res) => {
        let data = extractor(req)
        Logger.info('Generating PDF with data', data)

        try {
            data = await generator.templateServer.template?.hooks?.onPreGenerate(req, res, data)
            let pdf = await generator.generate(data)
            pdf = await generator.templateServer.template?.hooks?.onPostGenerate(req, res, pdf)

            Logger.debug('PDF generated correctly!')
            Logger.debug('Sending PDF...')

            res.writeHead(200, {'content-disposition': `attachment;`})
            res.write(pdf, 'binary')
            res.end(null, 'binary')

            Logger.debug('PDF sent!')
        } catch(e) {
            await generator.templateServer.template?.hooks?.onError(req, res, e)
        }
    }
}

class Server {
    constructor(port = 80, generator) {
        this.port = port
        this.generator = generator
    }

    serve() {
        Logger.info('Creating public server')
        const app = express()
        app.use(express.json())
        app.use(express.urlencoded({ extended: true }))
        app.use(Logger.expressLogger)

        app.get('/', handler(this.generator, req => req.query))
        app.post('/', handler(this.generator))

        app.listen(this.port)
        Logger.info(`Public server listening on port ${this.port}`)
    }
}

export { Server }