import Puppeteer from 'puppeteer'
import GenericPool from 'generic-pool'
import * as Logger from './Logger.mjs'

function createPool(size){
    const factory = {
        create(){
            Logger.debug('Creating browser instance in pool...')

            return Puppeteer
                .launch({args: ['--no-sandbox', '--disable-setuid-sandbox']})
                .catch(e => Logger.error('Somethig went wrong launching the browser instance!', e))
        },
        destroy(browser){
            Logger.debug('Destroying browser instance from pool...')
            return browser.close()
        },
        validate(browser){
            Logger.debug('Validating browser instance from pool...')
            return Promise.race([
                new Promise(res => setTimeout(() => res(false), 1500)),
                browser.version().then(_ => true).catch(_ => false)
            ])
        }
    };

    const options = {
        min: Math.max(Math.round(size / 4), 1),
        max: Math.max(size, 1),
        testOnBorrow: true,
        acquireTimeoutMillis: 15000
    }

    Logger.info('Creating browser connections pool...')

    return GenericPool.createPool(factory, options)
}

class PDFGenerator {
    constructor(templateServer, poolSize) {
        this.pool = createPool(poolSize)
        this.templateServer = templateServer
    }

    async generate(data) {
        const params = new URLSearchParams()
        for(let [key, value] of Object.entries(data)){
            params.append(key, value.toString())
        }

        Logger.debug('Acquiring browser connection from pool...')
        const browser = await this.pool.acquire()
        Logger.debug('Creating new page...')
        const page = await browser.newPage()
        await page.goto(`http://localhost:${this.templateServer.port}?${params.toString()}`, {waitUntil: "networkidle0"});
        Logger.debug('Exporting template to PDF...')
        const pdf = await page.pdf({
            format: 'A4',
            preferCSSPageSize: true,
            printBackground: true
        });
        await page.close()
        Logger.debug('Releasing browser connection from pool...')
        this.pool.release(browser)

        Logger.debug('PDF successfully generated!')
        return pdf
    }
}

export { PDFGenerator }