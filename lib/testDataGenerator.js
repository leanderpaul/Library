// Importing the in build packages from nodejs
const fs = require('fs');
const readline = require('readline');

// Importing the free source package installed using npm
const faker = require('faker');

// Declarations
let fileName = 'testDataOneGigaByte.txt';

// Function to generate fake library data
async function generateData(dataCount) {
    // Creating a write stream for writing data
    const writeStream = fs.createWriteStream(fileName);

    // Generating dataCount number of books
    for (let i = 0; i < dataCount; i++) {
        // Generating the author name, book name and count of the book(min = 1, max = 100)
        let authorName = faker.name.firstName() + ' ' + faker.name.lastName();
        let bookName = faker.random.words();
        let count = faker.random.number(99) + 1;
        let year = faker.random.number(70) + 1950;

        // Constructing the structure of how the data is present in the file
        let fileData = bookName + ':' + authorName + ':' + count + ':' + year + '\n';

        let isNotFull = writeStream.write(fileData);
        if (!isNotFull) await new Promise(done => setTimeout(() => done(), 10));
    }
    writeStream.end();
}

// Creating the interface to get input from the user interactively
const r1 = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Printing the question and passing the answer as the paramter to the function generate data to generate that number of sample data
r1.question('Enter the number of random books to generate: ', numberOfRandomBooks => {
    generateData(numberOfRandomBooks);
    r1.close();
});
