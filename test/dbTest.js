const mongoose = require('mongoose');

const testSchema = mongoose.Schema({ string: String });

const testModel = mongoose.model('Test', testSchema);

const mongodbOptions = { useNewUrlParser: true, useCreateIndex: true, bufferCommands: false };
let i = 1;
mongoose.connect('mongodb://localhost/mongodbTest', mongodbOptions);

mongoose.connection.on('connected', () => console.log(`Mongodb connected`));
mongoose.connection.on('error', err => console.log(err));
mongoose.connection.on('disconnected', () => console.log(`Mongodb Disconnected`));

setInterval(() => {
    let string = 'written ' + i++ + ' times';
    testModel.create({ string }, console.log);
}, 5000);
