const mongoose = require('mongoose');

const bookSchema = mongoose.Schema(
    {
        bookName: {
            type: String,
            required: true,
            unique: true
        },
        author: {
            type: String,
            required: true
        },
        count: {
            type: Number,
            required: true
        }
    },
    { strict: false }
);

module.exports = mongoose.model('Book', bookSchema);
