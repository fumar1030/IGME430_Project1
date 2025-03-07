const http = require('http');
const query = require('querystring');
const htmlHandler = require('./htmlResponses');
const jsonHandler = require('./jsonResponses');

var port = process.env.port || process.getActiveResourcesInfo.NODE_PORT || 3000;

const parseBody = (request, response, handler) => {
    const body = [];
  
    request.on('error', (err) => {
      console.dir(err);
      response.statusCode = 400;
      response.end();
    });
  
    request.on('data', (chunk) => {
      body.push(chunk);
    });
  
    request.on('end', () => {
      const bodyString = Buffer.concat(body).toString();
      request.body = query.parse(bodyString);
  
      handler(request, response);
    });
  };

const handlePost = (request, response, parsedUrl) => {
    if (parsedUrl.pathname === '/addBook') {
        parseBody(request, response, jsonHandler.addBook);
    }
    else if(parsedUrl.pathname === '/rateBook'){
        parseBody(request, response, jsonHandler.rateBook);
    }
};

const handleGet = (request, response, parsedUrl) => {
    //Making sure the parameters are parsed properly
    const queryParams = Object.fromEntries(parsedUrl.searchParams.entries());

    if (parsedUrl.pathname === '/') {
        htmlHandler.getIndex(request, response);
      }
    else if (parsedUrl.pathname === '/style.css') {
        htmlHandler.getStyle(request, response);
      }
    else if(parsedUrl.pathname === '/api/getBookTitles'){
        jsonHandler.getBookTitles(request, response, parsedUrl);
    }
    else if(parsedUrl.pathname === '/api/getBooks'){
        jsonHandler.getBooks(request, response, parsedUrl);
    }
    else if (parsedUrl.pathname === '/api/getBook') {
        jsonHandler.getBook(request, response, parsedUrl);
    } 
    else if(parsedUrl.pathname === '/api/getAllBooks'){
        jsonHandler.getAllBooks(request, response);
    }
    else if(parsedUrl.pathname === '/api/notReal'){
        jsonHandler.notReal(request, response);
    }
    else {
        jsonHandler.notReal(request, response);
    }
  };
  

const onRequest = (request, response) => {
    const protocol = request.connection.encrypted ? 'https' : 'http';
    const parsedUrl = new URL(request.url, `${protocol}://${request.headers.host}`);

    console.log(request.url);
    console.log('Parsed Query:', parsedUrl.searchParams.toString()); // Debugging line

    if(request.method === 'POST'){
        handlePost(request,response, parsedUrl);
    }
    else{
        handleGet(request,response,parsedUrl);
    }
  };

http.createServer(onRequest).listen(port, () => {
    console.log(`Listening on 127.0.0.1:${port}`);
})