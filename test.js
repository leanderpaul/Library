const fs = require('fs');
const { Transform } = require('stream');
const mongoose = require('mongoose');
const EventEmitter = require('events').EventEmitter;
// Importing the user defined modules
const bookModel = require('./model/book');

// Declartions
const signalEmitter = new EventEmitter();

let delimiter = ',',
    lineCount = 0,
    columns = ['bookName', 'author', 'count'],
    redundantCount = 0,
    requestsCompleted = 0;

console.time('time');

const transform = new Transform({
    transform: (chunk, encoding, done) => {
        let data = chunk.toString();
        let dataTemp = data.split('\n');
        lineCount += dataTemp.length;
        let books = [];
        for (index = 0; index < dataTemp.length; index++) books.push(parseFile(dataTemp[index]));

        // console.log(books);
        // Sending the books to the database as soon as the line limit is reached and resetting the books array
        signalEmitter.emit('sendPackage', data);
        done(null, books);
    }
});

const convertToString = new Transform({
    transform: (chunk, encoding, done) => {
        console.log('c');
        done(null, chunk.toString());
    }
});

// Function to parse line
const parseFile = line => {
    // Removing the firat and last character of the line and then splitting the line using comma
    line = line.split(delimiter);

    // Creating the book object
    let book = {};

    for (let index = 0; index < columns.length; index++) {
        book[columns[index]] = line[index];
    }

    // Returning the object
    return book;
};

// Function to handle redundant data by increasing the count of the books alone
const handleRedundantData = async redundantData => {
    // Incrementing the number of redundant datas and printing it
    // console.log(`Redundant data ${++redundantCount}: ${redundantData.bookName}`);
    redundantCount++;
    try {
        // Getting the Book document from the database
        let book = await bookModel.findOne({
            bookName: redundantData.bookName
        });

        // Incrementing the count of the document with the cound in the redundant data
        book.count += redundantData.count;

        // Saving the data to the database
        await book.save();

        // Emitting a signal to notify that the redundant data has been handled
        signalEmitter.emit('completedRequests', 1);
    } catch (err) {
        // Throwing error when an internal server occurs
        throw err;
    }
};

// Function to write Books to the database
const writeBooksToDatabase = async books => {
    // Setting the length of the array of books
    let dataCount = books.length;
    console.log(books);
    try {
        // Inserting multiple document simultaneously in a single request to the database
        await bookModel.insertMany(books, { ordered: false, rawResult: true });

        // Emitting a event to notify that all the books in the request have been added to the library
        signalEmitter.emit('completedRequests', dataCount);
    } catch (err) {
        // Checking for errors due a group of validation errors
        if (err.writeErrors) {
            // Multiple redundant data present

            let writeErrors = err.writeErrors;

            // Emitting a event to notify the number of books that have been added to the library
            signalEmitter.emit('completedRequests', dataCount - writeErrors.length);

            // Looping to each error in the request
            for (let i = 0; i < writeErrors.length; i++) {
                // Checking for redundant errors and handling the errors by incrementing the count of the book in the database
                if (writeErrors[i].err.code === 11000) await handleRedundantData(writeErrors[i].err.op);
                // Printing the error if any other errors other than redundancy errors are present in the request
                else console.log(writeErrors[i].err);
            }
        } else if (err.code === 11000) {
            // Emitting a event that notifies that all except one have been added to the library
            signalEmitter.emit('completedRequests', dataCount - 1);

            // Handling redundant error when only one redundant error is present in the request
            await handleRedundantData(err.op);
        } else {
            // Printing any other errors present in the database
            return { success: false, err };
        }
    }
    return { success: true, err: null };
};

// Function to keep a record of completed requests.
const recordOfCompletedRequests = countOfCompletedRequests => {
    // Updating the number of books that have been added to the database
    requestsCompleted += countOfCompletedRequests;

    // Checking if all the lines have been parsed and the books have added to the database
    if (requestsCompleted === lineCount && lineCount !== 0) {
        // Closing the mongodb database connection
        mongoose.connection.close();
        console.timeEnd('tot');

        // Printing the output of the operation.
        // console.log(`\nLines read: ${lineCount}`);
        console.log(`Books added to database: ${requestsCompleted - redundantCount}`);
        console.log(`Redundant books in the file: ${redundantCount}`);
        // console.log(`Validation Errors in the file:  ${validationErrors}`);

        // Printing the error that have been encountered.
        console.log(`\nErrors:`);
        // errors.forEach(error => console.log(error));
        console.log();

        // Logging the errors to the file
        // console.error(logErrors);
    }
};

// Listing to the sendPackage event to write the data to the database
signalEmitter.on('sendPackage', writeBooksToDatabase);

// Listening to completeRequests events
signalEmitter.on('completedRequests', recordOfCompletedRequests);

// Connecting to the mongodb database using multithreading having 20 paralle connections
mongoose.connect(
    'mongodb+srv://m220student:m220password@cluster0-fh58t.mongodb.net/library',
    { useNewUrlParser: true, useCreateIndex: true, poolSize: 20 },
    () => {
        console.log('DB Connection established');
        console.time('tot');
        fs.createReadStream('TestData.txt')
            .pipe(transform)
            .on('data', data => {
                // console.log(data);
            })
            .on('error', console.log)
            .on('end', () => {
                console.timeEnd('time');
            });
    }
);
