import { existsSync, readdirSync } from 'fs'
import { extname } from 'path'
import express from 'express'
import consolidate from 'consolidate'
const SUPPORTED_EXTENSIONS = ['.html', '.ejs', '.hbs', '.pug', '.jsx']

async function loadHooks(path) {
    if(existsSync(`${path}/hooks.mjs`))
        return await import(`${path}/hooks.mjs`)
    else return {}
}

const fallbackHooks = {
    onError: async (req, res, err) => res.status(500).send(err.toString()),
    onPreGenerate: async (req, res) => {},
    onPostGenerate: async (req, res, pdf) => pdf,
    onInit: async () => {}
}

class TemplateLoader {
    static async loadTemplate(path) {
        const hooks = await loadHooks(path)
        const file = readdirSync(path).filter(it => SUPPORTED_EXTENSIONS.includes(extname(it)) && it.includes('index'))[0]
        if(!file) {
            throw new Error("Failed to load template file!")
        }

        await hooks?.onInit()
        return new Template(hooks, path, file)
    }
}

class TemplateServer {
    constructor(template) {
        this.template = template
    }

    port = 0

    serve() {
        console.log('Setting up internal template server...')

        const app = express()
        app.use(express.urlencoded({ extended: true }))
        app.use(express.static(this.template.path))

        app.set('views', this.template.path)

        app.engine('html', consolidate.handlebars)
        app.engine('ejs', consolidate.ejs)
        app.engine('hbs', consolidate.handlebars)
        app.engine('pug', consolidate.pug)
        app.engine('jsx', consolidate.react)

        app.get('/', (req, res) => {
            res.render(this.template.file, req.query)
        })

        const server = app.listen(0)
        this.port = server.address().port

        console.log(`Template server runing on port ${this.port}!`)
    }
}

class Template {
    constructor(hooks, path, file) {
        this.hooks = { ...fallbackHooks, ...hooks }
        this.path = path
        this.file = file
    }
}

export {Template, TemplateLoader, TemplateServer}