const fs = require('fs');
const { Transform } = require('stream');

const mongoose = require('mongoose');
const date = require('date-and-time');
const bookModel = require('../model/book');

const projectDirectory = __dirname.slice(0, -3);
const fileName = projectDirectory + process.argv[2];
const logFileName = projectDirectory + 'logs/log-of-file-' + process.argv[2].split('/')[1] + '.log';
const booksNotWritten = projectDirectory + 'logs/not-added-file-' + process.argv[2].split('/')[1] + '.txt';
const maxNumberOfThreads = 32;
const readChunkSize = 64 * 1024;
const mongodbOptions = { useNewUrlParser: true, useCreateIndex: true, poolSize: 32, bufferCommands: false };
const fileReaderOptions = { highWaterMark: readChunkSize };
const insertManyOptions = { ordered: false, rawResult: true };
const logStream = fs.createWriteStream(logFileName);
const failedBooksStream = fs.createWriteStream(booksNotWritten);

let numberOfThreadsCurrently = 0;
let lastData = '';
let isReadComplete = false;
let lineCount = 0;
let isColumnConfigured = false;
let columns = ['bookName', 'author', 'count'];
let delimiter = ',';

const splitChunk = new Transform({
    transform: async (chunk, encoding, done) => {
        let data = lastData + chunk.toString();
        let arrayOfLines = data.split('\n');
        if (!isColumnConfigured) {
            let columnLine = arrayOfLines[0];
            for (index = 0; index < columnLine.length; index++)
                if (columnLine[index].toLowerCase() === columnLine[index].toUpperCase()) {
                    delimiter = columnLine[index];
                    break;
                }
            columns = columnLine.split(delimiter);
            isColumnConfigured = true;
            console.log(`Delimiter = ${delimiter}`);
            console.log(`Columns configuration: ${columns}`);
        }
        lastData = arrayOfLines.pop();
        let books = arrayOfLines.map((line, index) => new bookModel(parseLine(line)));
        let validBooks = books.filter((book, index) => {
            let err = book.validateSync();
            if (err) {
                failedBooksStream.write(arrayOfLines[index] + '\n');
                logStream.write(
                    '[ ' +
                        date.format(new Date(), 'DD MMM Y HH:mm:ss:SSS') +
                        ' ] : Error in line: ' +
                        (lineCount + index + 1) +
                        ', Error Type: ' +
                        err.name +
                        ', Error Details: ' +
                        err.errors.count.message +
                        '\n'
                );
            } else return book;
        });
        lineCount += arrayOfLines.length;
        while (numberOfThreadsCurrently === maxNumberOfThreads) await new Promise(done => setTimeout(() => done(), 1));
        numberOfThreadsCurrently++;
        done();
        insertBooksIntoDB(validBooks);
    }
});

mongoose.connect('mongodb://localhost/Library', mongodbOptions);
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
mongoose.connection.on('close', () => {
    console.timeEnd('Total Time');
    console.log(`Logs are printed in file ${logFileName}`);
    logStream.end();
    failedBooksStream.end();
});

const parseLine = line => {
    line = line.split(delimiter);
    let book = {};
    for (let index = 0; index < columns.length; index++) book[columns[index]] = line[index];
    return book;
};

const handleRedundantData = async redundantData => {
    let bulkWriteArray = [];
    if (Array.isArray(redundantData)) {
        for (let index = 0; index < redundantData.length; index++) {
            const element = redundantData[index].err.op;
            const writeObject = {
                updateOne: {
                    filter: { book: element.book },
                    update: { $inc: { count: element.count } }
                }
            };
            bulkWriteArray.push(writeObject);
        }
    } else {
        const element = redundantData.op;
        const writeObject = {
            updateOne: {
                filter: { book: element.book },
                update: { count: { $inc: element.count } }
            }
        };
        bulkWriteArray.push(writeObject);
    }
    try {
        await bookModel.bulkWrite(bulkWriteArray, { ordered: false });
    } catch (err) {
        console.log(err);
    }
};

const insertBooksIntoDB = async (books, repeated = 0) => {
    try {
        await bookModel.insertMany(books, insertManyOptions);
    } catch (err) {
        if (err.writeErrors) {
            await handleRedundantData(err.writeErrors);
        } else if (err.code === 11000) {
            await handleRedundantData(err);
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
