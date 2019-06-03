const fs = require('fs');
const file = fs.createWriteStream('./big.file');

file.on('drain', () => console.log('Stream drained'));
file.on('error', () => console.log('error'));
file.on('finish', () => console.log('Completed'));

async function check() {
    for (let i = 0; i <= 1e9; i++) {
        let bool = file.write(
            'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n'
        );
        console.log(bool);
        if (!bool) await new Promise(done => setTimeout(() => done(), 100));
    }
    file.end();
}

check();
