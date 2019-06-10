// Importing the In-build packages from NodeJS
const fs = require('fs');
const { Transform } = require('stream');

// Importing Free open source packages from Npm
const mongoose = require('mongoose');
const date = require('date-and-time');

// Importing the Book schema used in the database
const bookModel = require('../model/book');

// The location of the project directory
const projectDirectory = __dirname.slice(0, -3);
// The location of the input file containing the books
const fileName = projectDirectory + process.argv[2];
// The location of the output log file
const logFileName = projectDirectory + 'logs/log-of-file-' + process.argv[2].split('/')[1] + '.log';
// The location of the output file where the books not inserted into the file would be writted
const booksNotWritten = projectDirectory + 'logs/not-added-file-' + process.argv[2].split('/')[1] + '.txt';
// The maximum number of threads writting to the db concurrently
const maxNumberOfThreads = 24;
// The amount of data being read at a time in bytes
const readChunkSize = 64 * 1024;
// The options used to open connection
const mongodbOptions = { useNewUrlParser: true, useCreateIndex: true, poolSize: maxNumberOfThreads, bufferCommands: false };
const fileReaderOptions = { highWaterMark: readChunkSize };
const insertManyOptions = { ordered: false, rawResult: true };

// Creating write streams to write log and books which have failed to insert into the database
const logStream = fs.createWriteStream(logFileName);
const failedBooksStream = fs.createWriteStream(booksNotWritten);

// The number of threads that are being used currently
let numberOfThreadsCurrently = 0;
// The temperary string to store the last line in the array of books
let lastData = '';
// A boolean variable to determine if reading of the file has been completed
let isReadComplete = false;
// A variable to keep a count of the number of lines read
let lineCount = 0;
// A boolean to determine if the coloumns abd delimiters are configured
let isColumnConfigured = false;
// Setting the default value of columns
let columns = ['bookName', 'author', 'count'];
// Setting the default value of delimiter
let delimiter = ',';

// Creating N number of threads
process.env.UV_THREADPOOL_SIZE = maxNumberOfThreads;

// A tranform function to transform the chunk of data comming through the pipe
const splitChunk = new Transform({
    transform: async (chunk, encoding, done) => {
        // Prepending the temp data before the chunk read
        let data = lastData + chunk.toString();
        // Splitting the string into an array of lines
        let arrayOfLines = data.split('\n');
        // Checking whether the columns and delimiters are configured
        if (!isColumnConfigured) {
            // Setting the first line of the file to the variable
            let columnLine = arrayOfLines[0];
            // Looping through the characters of the string to determine the delimiter used
            for (index = 0; index < columnLine.length; index++)
                // A condition to identify if the character is an alphabet or not
                if (columnLine[index].toLowerCase() === columnLine[index].toUpperCase()) {
                    // Setting the delimiter
                    delimiter = columnLine[index];
                    break;
                }
            // Splitting the first line using the delimiter to find the columns present in the file
            columns = columnLine.split(delimiter);
            // Setting that the columns is configured
            isColumnConfigured = true;
            // Prinitng the delimiter and columns to the console
            console.log(`Delimiter = ${delimiter}`);
            console.log(`Columns configuration: ${columns}`);
        }
        // Setting the last line of the array to the temperary variable
        lastData = arrayOfLines.pop();
        // Converting the lines to an array of objects
        let books = arrayOfLines.map((line, index) => new bookModel(parseLine(line)));
        // Removing the objects that do not meet the schema of the database
        let validBooks = books.filter((book, index) => {
            // Validating the object to check whether it matches the database schema
            let err = book.validateSync();
            // checks If there is an error in schema validation
            if (err) {
                // Writes the line that has failed the validation
                failedBooksStream.write(arrayOfLines[index] + '\n');
                // Writing the logs to the file
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
        // Incrementing the line count
        lineCount += arrayOfLines.length;
        // Waiting till the threads will be available if all the threads are used
        while (numberOfThreadsCurrently === maxNumberOfThreads) await new Promise(done => setTimeout(() => done(), 1));
        // Creating a new thread and executing it
        numberOfThreadsCurrently++;
        // Continuing to read the next chunk
        done();
        // Writing to the database
        insertBooksIntoDB(validBooks);
    }
});

// Connecting to the database
mongoose.connect('mongodb://localhost/Library', mongodbOptions);
// mongoose.connect('mongodb+srv://m220student:m220password@cluster0-fh58t.mongodb.net/Library', mongodbOptions);
// Executing a function when it is connected to the database
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
// Executing the function when an error occurs
mongoose.connection.on('error', console.log);
// Executing a function when the books are added to the database and the mongodb connection is closed
mongoose.connection.on('close', () => {
    console.timeEnd('Total Time');
    console.log(`Logs are printed in file ${logFileName}`);
    logStream.end();
    failedBooksStream.end();
});

// A function to parse a line of string in the file and convert it into an object
const parseLine = line => {
    line = line.split(delimiter);
    let book = {};
    for (let index = 0; index < columns.length; index++) book[columns[index]] = line[index];
    return book;
};

// A function to handle redundancy in the books prsent in the database
const handleRedundantData = async redundantData => {
    // Creating an array to contain the write operations
    let bulkWriteArray = [];
    // Checking if the input parameter is an array or object
    if (Array.isArray(redundantData)) {
        // Looping throught the array and Adding the write object to the bulk write array
        for (let index = 0; index < redundantData.length; index++) bulkWriteArray.push(convertToWriteObject(redundantData[index].err.op));
    } else {
        // Adding the update query to the bulk write object
        bulkWriteArray.push(convertToWriteObject(redundantData.op));
    }
    try {
        // Writing the bulkwrite array to the database
        await bookModel.bulkWrite(bulkWriteArray, { ordered: false });
    } catch (err) {
        // Printing the error to the console
        console.log(err);
    }
};

// A function to convert an object into update query
const convertToWriteObject = element => {
    // Creating an object to update the redundant data
    return {
        updateOne: {
            filter: { book: element.book },
            update: { $inc: { count: element.count } }
        }
    };
};

// A function to insert the books into the database
const insertBooksIntoDB = async (books, repeated = 0) => {
    try {
        // Inserting the books into the database
        await bookModel.insertMany(books, insertManyOptions);
    } catch (err) {
        // The array of write errors
        if (err.writeErrors) await handleRedundantData(err.writeErrors);
        // A single write error
        else if (err.code === 11000) await handleRedundantData(err);
        // An error due to mongodb connection failure
        else if (err.name === 'MongoError' || err.name === 'MongoNetworkError') {
            // Trying to insert into the database three times
            if (repeated < 3) {
                console.log('MongoDB Connection. Retrying...');
                insertBooksIntoDB(books);
            } else {
                console.log('Tried 3 times, the books could not be inserted into the database. check log for more details');
                // Writing the errors to the log file
                logStream.write(
                    '[ ' +
                        date.format(new Date(), 'DD MMM Y HH:mm:ss:SSS') +
                        ' ] : The following books could not be writted to the database due to connection error' +
                        books.toString() +
                        '\n'
                );
            }
            return;
        }
    }
    // destroying the thread
    numberOfThreadsCurrently--;
    // Closing the monmgodb connection as soon as all the write operations are complete
    if (isReadComplete === true && numberOfThreadsCurrently === 0) mongoose.connection.close();
};
