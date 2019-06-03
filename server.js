const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const multer = require('multer');
const http = require('http');
const { spawn } = require('child_process');
const socket = require('socket.io');
const EventEmitter = require('events').EventEmitter;

const app = express();
const server = http.Server(app);
const io = socket(server);
const signalEmitter = new EventEmitter();
const storageOptions = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, './uploads');
    },
    filename: function(req, file, callback) {
        callback(null, file.fieldname + '-' + Date.now());
    }
});
const fileUpload = multer({ storage: storageOptions });
const port = process.env.PORT || 8080;
const mongodbUri = process.env.MONGODB_URI || 'mongodb://localhost/libraryManagement';
const mongodbOptions = { useNewUrlParser: true, useCreateIndex: true };
const bookModel = require('./model/book');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));

mongoose.connect(mongodbUri, mongodbOptions, () => console.log(`MongoDB database connected to ${mongodbUri}`));

app.post('/', fileUpload.single('file'), async (req, res) => {
    res.json({
        id: req.file.path
    });
});

app.post('/search', async (req, res) => {
    let searchQuery = new RegExp(req.body.search);
    let skip = req.body.skip,
        searchBy = req.body.searchBy;
    console.log(searchBy);
    try {
        let searchResult = await bookModel
            .find({ [searchBy]: searchQuery }, '-_id -__v')
            .skip(skip)
            .limit(100);
        return res.json({ success: true, searchResult });
    } catch (err) {
        return res.json({ success: false, err });
    }
});

app.post('/library', async (req, res) => {
    let query = req.body;
    try {
        let countQuery = {},
            queryObject = {},
            searchQuery = new RegExp(query.searchQuery);
        if (query.minCount != '') countQuery.$gte = query.minCount;
        if (query.maxCount != '') countQuery.$lte = query.maxCount;
        if (query.searchQuery !== '') queryObject[query.searchBy] = searchQuery;
        if (Object.keys(countQuery).length > 0) queryObject.count = countQuery;
        let books = await bookModel
            .find(queryObject, '-_id -__v')
            .skip(query.skip)
            .limit(100)
            .sort({ [query.sortBy]: query.sortOrder });
        let count = await bookModel.countDocuments(queryObject);
        console.log(count);
        res.json({ books, success: true, count });
    } catch (err) {
        console.log(err);
        res.json({ success: false, err });
    }
});

app.post('/deleteBook', async (req, res) => {
    try {
        await bookModel.deleteOne({ bookName: req.body.bookName });
        res.json({ success: true });
    } catch (err) {
        res.json({ success: false, err });
    }
});

app.use('*', (req, res) => res.send('Server is Working!'));

io.on('connection', socket => {
    console.log(`client connected`);
    socket.on('processFile', data => {
        console.log(data)
        const fileProcess = spawn('node', ['--max-old-space-size=4096','/home/si180/Documents/LibraryManagementSystem/lib/addBooksFromFile.js', data]);

        fileProcess.stdout.on('data', outputData => socket.emit('log', outputData));
        fileProcess.stderr.on('error', console.log);
        fileProcess.on('exit', outputData => socket.emit('logEnd', outputData));
        signalEmitter.on(data, logData => console.log(logData));
    });
});

server.listen(port, () => console.log(`Server listening to port ${port}`));
