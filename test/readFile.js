const fs = require('fs');
const { Transform } = require('stream');

const mongoose = require('mongoose');
const bookModel = require('../model/book');

const fileName = process.argv[2];
const delimiter = ',';
const mongodbOptions = { useNewUrlParser: true, useCreateIndex: true, poolSize: 24 };
const maxNumberOfThreads = 24;
const columns = ['bookName', 'author', 'count'];

let numberOfThreadsCurrently = 0;

const splitChunk = new Transform({
    transform: async (chunk, encoding, done) => {
        let data = chunk.toString();
        let arrayOfLines = data.split('\n');
        let books = arrayOfLines.map((line, index) => parseLine(line));
        while (numberOfThreadsCurrently === maxNumberOfThreads) await new Promise(done => setTimeout(() => done(), 10));
        numberOfThreadsCurrently++;
        console.log(numberOfThreadsCurrently);
        done();
        setTimeout(() => numberOfThreadsCurrently--, 5000);
    }
});

mongoose.connect('mongodb://localhost/lib', mongodbOptions);
mongoose.connection.on('connected', () => {
    fs.createReadStream(fileName)
        .pipe(splitChunk)
        .on('data', data => {
            // console.log(data);
        })
        .on('error', err => console.log(err))
        .on('end', () => console.log('File read completely'))
        .on('close', () => console.log('File has been clossed'))
        .on('drain', () => console.log('Stream Drained'));
});
mongoose.connection.on('error', console.log);

const parseLine = line => {
    line = line.split(delimiter);
    let book = {};
    for (let index = 0; index < columns.length; index++) book[columns[index]] = line[index];
    return book;
};
