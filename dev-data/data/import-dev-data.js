const dotenv = require('dotenv');
const mongoose = require('mongoose')
const fs = require('fs');
const Tour = require('./../../models/tourModel');


dotenv.config({ path: './config.env' });



const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);



console.log(DB)
mongoose.connect(DB,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(con => {
        console.log(con.connections);
        console.log('DB connected succesfully 🪣')
    }).catch(err => {
        console.log('DB connection failed 👀', err)
    })




//Read Json file
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));

const importData = async () => {
    try {
        await Tour.create(tours);
        console.log('Data successfully loaded')
    }
    catch (err) {
        console.log(err);
    }
    process.exit();

}


//Delete data here
const deleteData = async () => {
    try {
        await Tour.deleteMany();
        console.log('Data successfully deleted')
    }
    catch (err) {
        console.log(err);
    }
    process.exit();
}

console.log(process.argv)

if (process.argv[2] === '--import') {
    importData()
} else if (process.argv[2] === '--delete') {
    deleteData()
}