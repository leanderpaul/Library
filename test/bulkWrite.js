const mongoose = require('mongoose');
const bookModel = require('../model/book');

mongoose.connect('mongodb://localhost/check', {
    useNewUrlParser: true,
    useCreateIndex: true,
    poolSize: 32,
    bufferCommands: false,
    autoIndex: false
});
mongoose.connection.on('connected', () => console.log('DB Connected'));

let bulkWriteData = [
    {
        updateOne: {
            filter: { book: { bookName: 'Automotive Coordinator invoice', author: 'Sigrid Hahn' } },
            update: { $inc: { count: 20 } },
            upsert: true
        }
    },
    {
        updateOne: {
            filter: { 'book.bookName': 'book 2', 'book.author': 'author of book 2' },
            update: { $inc: { count: 20 } },
            upsert: true
        }
    },
    {
        updateOne: {
            filter: { 'book.bookName': 'book 3', 'book.author': 'author of book 3' },
            update: { $inc: { count: 20 } },
            upsert: true
        }
    },
    {
        updateOne: {
            filter: { 'book.bookName': 'book 4', 'book.author': 'author of book 4' },
            update: { $inc: { count: 20 } },
            upsert: true
        }
    },
    {
        updateOne: {
            filter: { 'book.bookName': 'book 5', 'book.author': 'author of book 5' },
            update: { $inc: { count: 20 } },
            upsert: true
        }
    }
];

bookModel.bulkWrite(bulkWriteData, { ordered: false }, console.log);
