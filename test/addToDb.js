// process.env.UV_THREADPOOL_SIZE = 24;

const fs = require('fs');
const { Transform } = require('stream');

const mongoose = require('mongoose');
const bookModel = require('../model/book');

const fileName = '/home/si180/Documents/Library/' + process.argv[2];
const delimiter = ',';
const maxNumberOfThreads = 24;
const readChunkSize = 32 * 1024;
const columns = ['bookName', 'author', 'count'];
const mongodbOptions = { useNewUrlParser: true, useCreateIndex: true, poolSize: 24, bufferCommands: false };
const fileReaderOptions = { highWaterMark: readChunkSize };
const insertManyOptions = { ordered: false, rawResult: true };

let numberOfThreadsCurrently = 0;
let lastData = '';
let isReadComplete = false;

const splitChunk = new Transform({
    transform: async (chunk, encoding, done) => {
        let data = lastData + chunk.toString();
        let arrayOfLines = data.split('\n');
        lastData = arrayOfLines.pop();
        let books = arrayOfLines.map((line, index) => parseLine(line));
        while (numberOfThreadsCurrently === maxNumberOfThreads) await new Promise(done => setTimeout(() => done(), 1));
        numberOfThreadsCurrently++;
        done();
        insertBooksIntoDB(books);
    }
});

mongoose.connect('mongodb://localhost/check', mongodbOptions);
// mongoose.connect('mongodb+srv://m220student:m220password@cluster0-fh58t.mongodb.net/Library', mongodbOptions);
mongoose.connection.on('connected', () => {
    console.log('Connected to database successfully');

    console.time('Read Time');
    console.time('Total Time');

    fs.createReadStream(fileName, fileReaderOptions)
        .pipe(splitChunk)
        .on('data', data => {})
        .on('error', err => console.log(err))
        .on('end', () => {
            console.log('File read completely');
            console.timeEnd('Read Time');
            isReadComplete = true;
        })
        .on('close', () => console.log('File has been clossed'))
        .on('drain', () => {});
});
mongoose.connection.on('error', console.log);
mongoose.connection.on('close', () => console.timeEnd('Total Time'));

const parseLine = line => {
    line = line.split(delimiter);
    let book = {};
    for (let index = 0; index < columns.length; index++) book[columns[index]] = line[index];
    return book;
};

const handleRedundantData = async redundantData => {
    try {
        let book = await bookModel.findOne({ book: redundantData.book });
        book.count += redundantData.count;
        await book.save();
        return;
    } catch (err) {
        throw err;
    }
};

const insertBooksIntoDB = async (books, repeated = 0) => {
    try {
        await bookModel.insertMany(books, insertManyOptions);
    } catch (err) {
        if (err.writeErrors) {
            let writeErrors = err.writeErrors;
            for (let i = 0; i < writeErrors.length; i++) {
                if (writeErrors[i].err.code === 11000) await handleRedundantData(writeErrors[i].err.op);
                else console.log(writeErrors[i].err);
            }
        } else if (err.code === 11000) {
            await handleRedundantData(err.op);
        } else if (err.name === 'MongoError') {
            if (repeated < 3) {
                console.log('MongoDB Connection. Retrying...');
                insertBooksIntoDB(books);
            } else {
                console.log('Tried 3 times the following books could not be inserted into the database');
                console.log(books);
            }
            return;
        }
    }
    numberOfThreadsCurrently--;
    if (isReadComplete === true && numberOfThreadsCurrently === 0) mongoose.connection.close();
};
