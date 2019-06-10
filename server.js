// Importing the In-build packages from NodeJS
const http = require('http');
const { spawn } = require('child_process');

// Importing Free open source packages from Npm
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const multer = require('multer');
const socket = require('socket.io');

// Requiring the mongoDB book schema model
const bookModel = require('./model/book');

// Creating the express server
const app = express();
// Creating a server with http
const server = http.Server(app);
// Creating the server for socket io
const io = socket(server);

// Setting the storage options for file upload
const storageOptions = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, './uploads');
    },
    filename: function(req, file, callback) {
        callback(null, file.fieldname + '-' + Date.now());
    }
});

// Creating the variable to upload files
const fileUpload = multer({ storage: storageOptions });
// Setting the port of the server
const port = process.env.PORT || 8080;
// Setting the mongoDB URI
const mongodbUri = process.env.MONGODB_URI || 'mongodb://localhost/Library';
// Setting the mongoDB Connection options
const mongodbOptions = { useNewUrlParser: true, useCreateIndex: true };

// Middlewares used in the server
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Connecting to the mongodb server
mongoose.connect(mongodbUri, mongodbOptions);
mongoose.connection.on('connected', () => console.log(`MongoDB database connected to ${mongodbUri}`));
mongoose.connection.on('error', console.log);

// @route   POST /
// @body    { file: file to upload }
// @desc    The file is uploaded to the server
app.post('/', fileUpload.single('file'), async (req, res) => {
    res.json({
        id: req.file.path
    });
});

// @route   POST /search
// @body    { search: The search query string, searchBy: The key by which the serach should be conducted, skip: The number of books to skip }
// @desc    Searching for the data from the database for the given query
app.post('/search', async (req, res) => {
    let searchQuery = new RegExp(req.body.search);
    let skip = req.body.skip,
        searchBy = req.body.searchBy;
    try {
        // Getting the search result from the database
        let searchResult = await bookModel
            .find({ ['book.' + searchBy]: searchQuery }, '-_id -__v')
            .skip(skip)
            .limit(100);
        return res.json({ success: true, searchResult });
    } catch (err) {
        return res.json({ success: false, err });
    }
});

// @route   POST /library
// @body    {
//              searchAuthor: Author search query,
//              searchBookNane: book name search query,
//              minCount: minimum count,
//              maxCount: maximum count,
//              skip: the number of books to skip,
//              sortBy: The field which should be used to sort,
//              sortOrder: The order in which to sort the field
//          }
// @desc    Search the database for the books that match the query
app.post('/library', async (req, res) => {
    let query = req.body;
    try {
        let countQuery = {},
            searchAuthor = new RegExp(query.searchAuthor),
            searchBookName = new RegExp(query.searchBookName),
            // searchQuery = new RegExp(query.searchQuery),
            queryObject = {};
        if (query.minCount != '') countQuery.$gte = Number(query.minCount);
        if (query.maxCount != '') countQuery.$lte = Number(query.maxCount);
        // queryObject[query.searchBy] = searchQuery;
        // Setting the search query
        queryObject = { 'book.bookName': searchBookName, 'book.author': searchAuthor };
        if (Object.keys(countQuery).length > 0) queryObject.count = countQuery;
        // Getting the result of the search query
        let books = await bookModel
            .find(queryObject, '-_id -__v')
            .skip(query.skip)
            .limit(100)
            .sort({ ['book.' + query.sortBy]: query.sortOrder });
        // Getting the count of the number of documents that meet the search query
        let count = await bookModel.countDocuments(queryObject);
        res.json({ books, success: true, count });
    } catch (err) {
        // Printing the error to the console when an error occurs
        console.log(err);
        res.json({ success: false, err });
    }
});

// @route   POST /deleteBook
// @body    { bookName: the name of the book to delete, author: the author of the book to delete }
// @desc    The route to delete the book from the library
app.post('/deleteBook', async (req, res) => {
    try {
        // Deleting the book from the database
        await bookModel.deleteOne({ 'book.bookName': req.body.bookName, 'book.author': req.body.author });
        res.json({ success: true });
    } catch (err) {
        // When an error occurs when deleting the book from the library
        res.json({ success: false, err });
    }
});

// @route   ALL *
// @desc    For all the other request
app.use('*', (req, res) => res.send('Server is Working!'));

// Socket io connection
io.on('connection', socket => {
    console.log(`client connected`);
    socket.on('processFile', data => {
        // Creating a thread to run the file that adds the books in the file to the database
        const fileProcess = spawn('node', [__dirname + '/lib/addBooksFromFile.js', data]);

        // Handling the different events that occur
        fileProcess.stdout.on('data', outputData => socket.emit('log', outputData));
        fileProcess.stderr.on('error', console.log);
        fileProcess.on('close', outputData => socket.emit('logEnd', outputData));
    });
    socket.on('disconnect', () => console.log('Client disconnected'));
});

// Making  the server listen to the port specified
server.listen(port, () => console.log(`Server listening to port ${port}`));
