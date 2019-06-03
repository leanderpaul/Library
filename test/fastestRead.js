const fs = require('fs');

console.time('Read Time');
console.log('Starting to read');

fs.createReadStream('/home/si180/Documents/LibraryManagementSystem/' + process.argv[2])
    .on('data', () => {})
    .on('end', () => console.timeEnd('Read Time'))
    .on('error', console.log);
