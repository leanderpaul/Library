const readline = require('readline');
const fs = require('fs');
const EventEmitter = require('events').EventEmitter;
const myEmitter = new EventEmitter();

let firstBuffer = [],
    secondBuffer = [];
let delimiter = ',';

let flag = false;
let tcolnames = ['bookname', 'author', 'count'];

// const rl = readline.createInterface({
//   input: fs.createReadStream("libraryData.txt"),
//   crlfDelay: Infinity
// });
// rl.on("line", line => {
//   if (flag === false) {
//     read = line;

//     let n = read.length;
//     let splchar = "!#$%&'()*+,-./:;<=>?@[]^_`{|}~";

//     let m = splchar.length;
//     let i = 0,
//       j = 0;
//     while (i < n) {
//       j = 0;
//       while (j < m) {
//         if (read.charAt(i) == splchar.charAt(j)) {
//           delimiter = read.charAt(i);

//           break;
//         }
//         j++;
//       }
//       i++;
//     }

//     console.log(delimiter);

//     tcolnames = read.split(delimiter);
//     //lengthh = tcolnames.length;

//     for (a = 0; a < tcolnames.length; a++) {
//       tcolnames[a] = tcolnames[a].toLowerCase();
//     }
//   }

//   flag = true;

//   rl.close();
// });

const readStream = readline.createInterface({
    input: fs.createReadStream('test.txt'),
    crlfDelay: Infinity
});

readStream.on('line', line => {
    let book = parseFile(line);
    let firstLetterCapitalized = book.book.bookname.toUpperCase();
    let splitterCode = firstLetterCapitalized.charCodeAt(0);
    if (splitterCode < 78) firstBuffer.push(book);
    else secondBuffer.push(book);
    if (firstBuffer.length > 9) {
        myEmitter.emit('sendFirstBuffer', firstBuffer);
        firstBuffer = [];
    }
    if (secondBuffer.length > 9) {
        myEmitter.emit('sendSecondBuffer', secondBuffer);
        secondBuffer = [];
    }
});

const parseFile = line => {
    let data = line.split(delimiter);
    let record = {
        book: {}
    };
    for (b = 0; b < tcolnames.length; b++) {
        if (tcolnames[b] != 'count') {
            record.book[tcolnames[b]] = data[b];
        } else {
            record[tcolnames[b]] = data[b];
        }
    }
    return record;
};

myEmitter.on('sendFirstBuffer', buffer => {
    console.log('first Buffer');
    console.log(buffer);
});

myEmitter.on('sendSecondBuffer', buffer => {
    console.log('second Buffer');
    console.log(buffer);
});
