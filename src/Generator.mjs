import Puppeteer from 'puppeteer';
import GenericPool from 'generic-pool';

function createPool(size){
    const factory = {
        create(){
            console.log('Creating browser instance in pool...')

            return Puppeteer
                .launch({args: ['--no-sandbox', '--disable-setuid-sandbox']})
                .catch(e => console.error(e))
        },
        destroy(browser){
            console.log('Destroying browser instance from pool...')
            return browser.close()
        },
        validate(browser){
            console.log('Validating browser instance from pool...')
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

    console.log('Creating browser connections pool...')

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

        console.log('Acquiring browser connection from pool...')
        const browser = await this.pool.acquire()
        console.log('Creating new page...')
        const page = await browser.newPage()
        await page.goto(`http://localhost:${this.templateServer.port}?${params.toString()}`, {waitUntil: "networkidle0"});
        console.log('Exporting template to PDF...')
        const pdf = await page.pdf({
            format: 'A4',
            preferCSSPageSize: true,
            printBackground: true
        });
        await page.close()
        console.log('Releasing browser connection from pool...')
        this.pool.release(browser)

        console.log('Template exported correctly!')
        return pdf
    }
}

export { PDFGenerator }