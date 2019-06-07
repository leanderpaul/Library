// Importing the in build modules from nodejs
const fs = require('fs');
const EventEmitter = require('events').EventEmitter;

// Importing the npm node modules
const mongoose = require('mongoose');
const es = require('event-stream');
const now = require('performance-now');

// Importing the user defined modules
const bookModel = require('../model/book');

// Declartions
const signalEmitter = new EventEmitter();
let fileName = '/home/si180/Documents/LibraryManagementSystem/' + process.argv[2],
    lineCount = 0,
    lineLimit = 100,
    redundantCount = 0,
    requestsCompleted = 0,
    validationErrors = 0,
    errors = [],
    logErrors = [],
    books = [],
    delimiter = ',',
    columns = ['bookName', 'author', 'count'],
    t0,
    t1;

// Function to write Books to the database
const writeBooksToDatabase = async books => {
    // Setting the length of the array of books
    let dataCount = books.length;

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
        } else if (err.name === 'MongoError') {
            console.log('Mongodb connection is disconnected and the following data could not be written to the db');
            console.log(books);
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
    if (requestsCompleted === lineCount - validationErrors - 1 && lineCount !== 0) {
        // Closing the mongodb database connection
        mongoose.connection.close();

        // Printing the output of the operation.
        console.log(`\nLines read: ${lineCount}`);
        console.log(`Books added to database: ${requestsCompleted - redundantCount}`);
        console.log(`Redundant books in the file: ${redundantCount}`);
        console.log(`Validation Errors in the file:  ${validationErrors}`);

        // Printing the error that have been encountered.
        console.log(`\nErrors:`);
        errors.forEach(error => console.log(error));
        console.log();

        // Logging the errors to the file
        console.error(logErrors);
    }
};

// Function to handle redundant data by increasing the count of the books alone
const handleRedundantData = async redundantData => {
    // Incrementing the number of redundant datas and printing it
    console.log(`Redundant data ${++redundantCount}: ${redundantData.bookName}`);
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

// Function to configure the columns of the file
const configColumns = columnData => {
    // Setting the columns config
    columns = columnData.split(delimiter);
};

// Listing to the sendPackage event to write the data to the database
signalEmitter.on('sendPackage', writeBooksToDatabase);

// Listening to completeRequests events
signalEmitter.on('completedRequests', recordOfCompletedRequests);

// Function which adds books to the database from a file
const addBooksFromFile = fileName => {
    // Creating a read stream to read the file line by line
    fs.createReadStream(fileName)

        // Creating a pipe for the output of the stream and splitting the data by line
        .pipe(es.split())

        // Creating another pipe to read the lines
        .pipe(
            // Mapping by lines
            es
                .mapSync(function(line, callback) {
                    // console.log(line); //REmove

                    // Incrementing the line count before reading the line
                    lineCount += 1;

                    // Skipping the first line which contains the column configuration
                    if (lineCount === 1) {
                        configColumns(line);
                        // callback(null,line);
                        return;
                    }

                    // Add the parsed line to the books array
                    let book = new bookModel(parseFile(line));

                    // Validate the book for the presence of any cast errors
                    let err = book.validateSync();

                    // If there are any type casting error then print the error and then skip this book
                    if (err) {
                        logErrors.push(err);
                        validationErrors++;
                        errors.push(err.name + ' in line ' + lineCount);
                        return;
                    }

                    // If there are no type casting errors then push the books into the books array
                    books.push(book);

                    // Checking if the books per request has reached
                    if (books.length === lineLimit) {
                        // Sending the books to the database as soon as the line limit is reached and resetting the books array
                        signalEmitter.emit('sendPackage', books);
                        // Emptying the books array
                        books = [];
                    }
                })

                // Printing the error when an error events has been triggered
                .on('error', console.log)

                // Sending the remaining books after the file has completed reading
                .on('end', () => {
                    console.timeEnd('Read Time');
                    console.log(`Files read completely`);
                    signalEmitter.emit('sendPackage', books);
                })
        )
        .on('drain', () => {
            console.log('Stream has been drained');
        });
};

// Connecting to the mongodb database using multithreading having 20 paralle connections
mongoose.connect(
    'mongodb+srv://m220student:m220password@cluster0-fh58t.mongodb.net/testLibrary',
    { useNewUrlParser: true, useCreateIndex: true, poolSize: 20, bufferCommands: false },
    () => {
        // Initializing Timer
        console.time('Read Time');
        console.time('Total Time');

        // Initializing performance timer
        t0 = now();

        /*
        Calling the function to add the books and add it to the database
        inputs are fileName and the function to parse the lines of the file 
    */
        addBooksFromFile(fileName);
    }
);

mongoose.connection.on('close', () => {
    // Printing the time taken to complete the entire operation
    console.timeEnd('Total Time');

    // Getting the time from performance-now node module
    t1 = now();

    // Printing the time provided by performance now
    console.log(`Performance of this solution: ${(t1 - t0).toFixed(3)} ms`);
});

mongoose.connection.on('connected', () => console.log('Connected to database'));
mongoose.connection.on('disconnedted', () => console.log('Db Disconnected. Trying to reconnect'));

console.log(`The File to be processed is on location: ${fileName}`);
