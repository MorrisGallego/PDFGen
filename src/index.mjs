import { TemplateLoader, TemplateServer } from './Templates.mjs'
import { PDFGenerator } from './Generator.mjs'
import { Server } from './Server.mjs'
import * as Logger from './Logger.mjs'

const TEMPLATE_PATH = process.env.TEMPLATE_PATH || '../template'
const POOL_SIZE = process.env.POOL_SIZE || 4
const PORT = process.env.PORT || 80

async function main() {
    const template = await TemplateLoader.loadTemplate(TEMPLATE_PATH)
    const templateServer = new TemplateServer(template)
    const generator = new PDFGenerator(templateServer, POOL_SIZE)
    const server = new Server(PORT, generator)

    templateServer.serve()
    server.serve()
}

main().catch(e => Logger.error('Something strange happened!', e))