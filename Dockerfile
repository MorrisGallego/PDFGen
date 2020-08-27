FROM buildkite/puppeteer:latest

RUN mkdir -p /opt/pdfgen

COPY package.json /opt/pdfgen/
COPY src /opt/pdfgen/src

WORKDIR /opt/pdfgen

RUN npm install

EXPOSE 8000
CMD node ./src/index.mjs