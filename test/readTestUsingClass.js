const fs = require('fs');
const { Transform } = require('stream');
const mongoose = require('mongoose');
const bookModel = require('../model/book');

const mongodbOptions = { useNewUrlParser: true, useCreateIndex: true, poolSize: 24 };

class TransformChunk extends Transform {
    constructor() {
        super({ objectMode: true });
        this.columns = ['bookName', 'author', 'count'];
        this.delimiter = ',';
        this.lineCount = 0;
        this.finishCount = 0;
    }

    _transform(chunk, encoding, done) {
        let data = chunk.toString();
        let lines = data.split('\n');
        let books = lines.map(line => this.parseFile(line));
        this.lineCount += books.length;
        this.sendBooks(books);
        done(null, books);
    }

    parseFile(line) {
        line = line.split(this.delimiter);
        let book = {};
        for (let index = 0; index < this.columns.length; index++) {
            book[this.columns[index]] = line[index];
        }
        return book;
    }

    async sendBooks(books) {
        try {
            await bookModel.insertMany(books, { ordered: false, rawResult: true });
        } catch (err) {
            if (err.writeErrors) {
                let writeErrors = err.writeErrors;
                for (let i = 0; i < writeErrors.length; i++) {
                    if (writeErrors[i].err.code === 11000) await this.handleRedundantData(writeErrors[i].err.op);
                    else console.log(writeErrors[i].err);
                }
            } else if (err.code === 11000) {
                await this.handleRedundantData(err.op);
            } else {
                return { success: false, err };
            }
        }
        console.log('hoho')
        this.checkForComplete(books.length);
        return { success: true, err: null };
    }

    async handleRedundantData(redundantData) {
        redundantCount++;
        try {
            let book = await bookModel.findOne({
                bookName: redundantData.bookName
            });
            book.count += redundantData.count;
            await book.save();
        } catch (err) {
            throw err;
        }
    }

    checkForComplete(number) {
        if (number) this.finishCount += number;
        if (this.lineCount === this.finishCount) mongoose.connection.close();
        console.log(`lineCount: ${this.lineCount}, finishCount: ${this.finishCount}`);
    }
}

let transformer = new TransformChunk();

mongoose.connect('mongodb://localhost/testLibrary', mongodbOptions, () => {
    console.log('Connected to db');
    console.time('Read Time');
    fs.createReadStream('test.txt')
        .pipe(transformer)
        .on('data', data => {})
        .on('end', () => console.timeEnd('Read Time'));
});
