# PDF generator tool
This tool is intended for generating PDFs from an HTML template

It creates an internal server where templates are served, and a public server where you can GET/POST the data (as query params or as JSON body, respectively) needed to generate the PDFs.
The script uses puppeteer to generate PDFs from HTML pages. 
For better performance, a pool of browser connections is used to render the pages. 

## Templates
Currently, templates can be defined using plain `html (.html)`, `handlebars (.hbs)`, `pug (.pug)`, `ejs (.ejs)` and `react (.jsx)`. 
The generator will look for a file named `index` at the templates folder as its entry point.

Page size and orientation can be defined in the template styles using `@page` declarations.

### Template hooks
The template can define 4 hooks for the generation lifecycle:

- `onPreGeneration(req, res, data) : data`
- `onPostGeneration(req, res, pdf) : pdf`
- `onInit() : void`
- `onError(req, res, error) : void`

This hooks can be used to modify the data that will be used for the generation, for validation, for signing the PDF...

## Docker deployment
The tool can be deployed using docker. 
You can specify your custom template mounting a volume in /opt/pdfgen/template.
You can also specify the puppeteer pool size by setting the env variable PUPPETEER_POOL_SIZE to an integer value. 