const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv'); // for enviroment veriable
const Toure = require('../../models/toursmodel');
const Review = require('../../models/reviewModel');
const User = require('../../models/userModel');

dotenv.config({ path: '../../config.env' });

const DB = process.env.DATABASE.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD
);

mongoose
    .connect(DB, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true, // to remove erroe/ worning on consol
    })
    .then(() => {
        console.log('DB is confected to app.....');
    })
    .catch((err) => {
        console.log(`db error ${err.message}`);
    });
///////READ FILE
const toure = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const review = JSON.parse(
    fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);
const user = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));

//////import data
const importData = async () => {
    try {
        await Toure.create(toure);
        await Review.create(review, { validateBeforeSave: false });
        await User.create(user, { validateBeforeSave: false });
        console.log('data loaded successfully');
        process.exit();
    } catch (err) {
        console.log(err);
    }
};

////////delet data
const deleatAll = async () => {
    try {
        await Toure.deleteMany();
        await Review.deleteMany();
        await User.deleteMany();
        console.log('deleted!!!');
        process.exit();
    } catch (err) {
        console.log(err);
    }
};
if (process.argv[2] === '--import') {
    importData();
} else if (process.argv[2] === '--delet') {
    deleatAll();
}
console.log(process.argv);
