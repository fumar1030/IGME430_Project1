const fs = require('fs');

const bookPath = fs.readFileSync(`${__dirname}/../assets/books.json`, 'utf8');
let books = [];
books = JSON.parse(bookPath);

///
///Have a central function that will do all the writing so I don't have to do it every method
///
const sendResponse = (response, statusCode, data = null) => {

    response.writeHead(statusCode, {
        'Content-Type': 'application/json',
        'Content-Length': data ? Buffer.byteLength(data) : 0,
    });
    if (data){
        response.write(data);
    }
    response.end();
};

///
///Method to find the title of a book
///
const getBookTitles = (request, response, parsedUrl) => {
    const author = parsedUrl.searchParams.get('author');
    const year = parsedUrl.searchParams.get('year');
    let filteredBooks = books;

    if (!author && !year){
        return sendResponse(response, 400, JSON.stringify({ message: 'At least one search parameter is required' }));
    }
    
        if (author && author.trim() !== '') {
            filteredBooks = filteredBooks.filter(book => {
                return book.author && book.author.toLowerCase().includes(author.toLowerCase());
            });
        }
        if (year) {
            filteredBooks = filteredBooks.filter(book => book.year === parseInt(year));
        }
    //Making it where it only prints the titles
    const titles = filteredBooks.map(book => book.title);

    //If there are no books at all
    if (titles.length === 0) {
        return sendResponse(response, 404, JSON.stringify({ message: 'No books found matching the criteria' }));
    }

    sendResponse(response, 200, JSON.stringify({ books: titles }));
};

///
///Method to request several books via the search parameters
///
const getBooks = (request, response, parsedUrl) => {
    const title = parsedUrl.searchParams.get('title');
    const author = parsedUrl.searchParams.get('author');
    const year = parsedUrl.searchParams.get('year');
    let filteredBooks = books;
    
    if (!title && !author & !year){
        return sendResponse(response, 400, JSON.stringify({ message: 'At least one search parameter is required' }));
    }

    //Include possible search parameters
    if (title) filteredBooks = filteredBooks.filter(book => book.title.toLowerCase().includes(title.toLowerCase()));
    if (author) filteredBooks = filteredBooks.filter(book => book.author.toLowerCase().includes(author.toLowerCase()));
    if (year) filteredBooks = filteredBooks.filter(book => book.year === parseInt(year));
    
    if (filteredBooks.length === 0) {
        return sendResponse(response, 404, JSON.stringify({ message: 'No books found matching the criteria' }));
    }

    sendResponse(response, 200, JSON.stringify({ books: filteredBooks }));
};

///
///Method to grab a book only by the title
///
const getBook = (request, response, parsedUrl) => {
    const title = parsedUrl.searchParams.get('title'); // Use parsedUrl directly to get query params

    //Making sure the title is included
    if (!title){
        return sendResponse(response, 400, JSON.stringify({ message: 'Title is required' }));
    }
    
    //If book is not found in dataset
    const book = books.find(book => book.title.toLowerCase() === title.toLowerCase());
    if (!book){
        return sendResponse(response, 404, JSON.stringify({ message: 'Book not found' }));
    } 
    
    sendResponse(response, 200, JSON.stringify(book));
};

///
///Method to print all the books
///
const getAllBooks = (request, response) => {
    sendResponse(response, 200, JSON.stringify({ books }));
};

///
///Method to add a new book to the dataset
///
const addBook = (request, response) => {
    const { title, author, year, genres} = request.body;

    //Make sure all parameters are included
    if (!title || !author || !year || !genres) {
        return sendResponse(response, 400, JSON.stringify({ message: 'Title, author, year, and genres are required' }));
    }
    
    //Maing sure not to add the same book twice
    if (books.some(book => book.title.toLowerCase() === title.toLowerCase())) {
        return sendResponse(response, 400, JSON.stringify({ message: 'Book already exists' }));
    }
    
    //Adding the new book
    const newBook = { title, author, year: parseInt(year), genres: genres.split(',').map(g => g.trim()) };
    books.push(newBook);
    sendResponse(response, 201, JSON.stringify({newBook}));
};

///
///Method to add a rating to a book in the dataset
///
const rateBook = (request, response) => {
    const { title, rating } = request.body;

    //Making sure parameters are met
    if (!title || !rating) return sendResponse(response, 400, JSON.stringify({ message: 'Title and rating are required' }));
    
    //If book not found
    const book = books.find(book => book.title.toLowerCase() === title.toLowerCase());
    if (!book) return sendResponse(response, 404, JSON.stringify({ message: 'Book not found' }));
    
    //Updating book
    book.rating = parseFloat(rating);
    sendResponse(response, 200, JSON.stringify({book}));
};

/// 
///Will delete a book title
///
const deleteBook = (request, response, parsedUrl) => {
    const title = parsedUrl.searchParams.get('title');
    if (!title) {
        return sendResponse(response, 400, JSON.stringify({ message: 'Title is required' }));
    }

    const initialLength = books.length;
    books = books.filter(book => book.title.toLowerCase() !== title.toLowerCase());

    if (books.length === initialLength) {
        return sendResponse(response, 404, JSON.stringify({ message: 'Book not found' }));
    }
    
    sendResponse(response, 204,JSON.stringify({ message: 'Book deleted' }))
};

const notReal = (request, response) => {
    const responseJSON = {
        message: 'Resource not found',
        id: 'not_found'
    };

    response.writeHead(404, { 'Content-Type': 'application/json' });

    if (request.method !== 'HEAD') {
        response.write(JSON.stringify(responseJSON));
    }

    response.end();
};



module.exports = {
    getBookTitles,
    getBooks,
    getBook,
    getAllBooks,
    addBook,
    rateBook,
    deleteBook,
    notReal
};
