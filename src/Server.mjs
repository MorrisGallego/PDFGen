import express from 'express';

function handler(generator, extractor = req => req.body) {
    return async (req, res) => {
        console.log(`[${req.ip}] Generating PDF with data:`)
        console.table(extractor(req))

        let data = extractor(req)

        try {
            data = await generator.templateServer.template?.hooks?.onPreGenerate(req, res, data)
            let pdf = await generator.generate(data)
            pdf = await generator.templateServer.template?.hooks?.onPostGenerate(req, res, pdf)

            console.log('PDF generated correctly!')
            console.log('Sending PDF...')

            res.writeHead(200, {'content-disposition': `attachment;`})
            res.write(pdf, 'binary')
            res.end(null, 'binary')

            console.log('PDF sent!')
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
        console.log('Creating public server')
        const app = express()
        app.use(express.json())
        app.use(express.urlencoded({ extended: true }))

        app.get('/', handler(this.generator, req => req.query))
        app.post('/', handler(this.generator))

        app.listen(this.port)
        console.log(`Public server listening on port ${this.port}`)
    }
}

export { Server }