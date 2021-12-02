const mongoose = require('mongoose');
const dotenv = require('dotenv'); // for environment veritable
const log = require('./costume_console/costumeColoursForLogs');
require('./costume_console/coustmizDefaultVariablStyle')();
const app = require('./app');

process.on('uncaughtException', (err) => {
    console.log(log.danger, 'UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    process.exit(1);
});

dotenv.config({ path: './config.env' }); // to adds config file

console.log(process.env.PORT); // to log list of other environment veritable
// console.log(app.get('evn')); // to log development status

const DB = process.env.DATABASE.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD
);

mongoose
    .connect(DB, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true, // to remove error/ working on consol
    })
    .then(() => {
        // console.log(con.connections);
        console.log(log.black, 'DB is connected to app.....');
    })
    .catch((err) => {
        console.log(log.danger, `db error ${err.message}`);
    });

const port = process.env.PORT || 8000;
const server = app.listen(port, () => {
    console.log(log.black, `server is running on ${port} .......`);
});

process.on('unhandledRejection', (err) => {
    //FIXME: something is wrong
    console.log(log.danger, 'UNHANDLED REJECTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});
