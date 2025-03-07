const fs = require('fs');

const index = fs.readFileSync(`${__dirname}/../client/client.html`);
const styles = fs.readFileSync(`${__dirname}/../client/style.css`);
const docs = fs.readFileSync(`${__dirname}/../client/docs.html`);

const getIndex = (request, response) => {
    response.writeHead(200, {'Content-Type': 'text/html'});
    response.write(index);
    response.end();
};

const getStyle = (request, response) => {
    response.writeHead(200, {'Content-Type': 'text/css'});
    response.write(styles);
    response.end();
};

const getDocs = (request, response) => {
    response.writeHead(200, {'Content-Type': 'text/html'});
    response.write(docs);
    response.end();
};

module.exports = {
    getIndex,
    getStyle,
    getDocs
}