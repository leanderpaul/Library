const fs = require('fs');

const writeStream = fs.createWriteStream('writeTest.txt');

for (let index = 1; index < 25000000; index++) {
    let bookName = 'Book Number ' + index;
    let authorName = 'Author Number ' + index;
    let count = 30;
    let writeData = bookName + ',' + authorName + ',' + count + '\n';
    writeStream.write(writeData);
}

writeStream.end();
