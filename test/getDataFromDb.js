const mongoose = require('mongoose');
const bookModel = require('../model/book');

mongoose.connect('mongodb://localhost/authAndBookUnique');

bookModel.find((err, docs) => {
    docs.forEach(doc => console.log(doc.bookName));
});
