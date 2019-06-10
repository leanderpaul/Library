const mongoose = require('mongoose');

// const bookSchema = mongoose.Schema(
//     {
//         bookName: {
//             type: String,
//             required: true,
//             unique: true
//         },
//         author: {
//             type: String,
//             required: true
//         },
//         count: {
//             type: Number,
//             required: true
//         }
//     },
//     { strict: false }
// );

const bookSchema = mongoose.Schema(
    {
        book: {
            type: {
                bookName: {
                    type: String,
                    required: true
                },
                author: {
                    type: String,
                    required: true
                }
            },
            required: true,
            unique: true
        },
        count: {
            type: Number,
            required: true
        }
    },
    { strict: false }
);

bookSchema
    .virtual('bookName')
    .get(function() {
        return this.book.bookName;
    })
    .set(function(data) {
        this.book = { bookName: data };
    });

bookSchema
    .virtual('author')
    .get(function() {
        return this.book.author;
    })
    .set(function(data) {
        this.book.author = data;
    });

bookSchema.methods.toJSON = function() {
    let tempRecord = this._doc;
    let book = this.book;
    delete tempRecord.book;
    let bookRecord = Object.assign(book, tempRecord);
    return bookRecord;
};

module.exports = mongoose.model('Book', bookSchema);
