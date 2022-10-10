const dotenv = require('dotenv');
const mongoose = require('mongoose')
dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

const app = require('./app');

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




const { PORT } = process.env || 3000;
app.listen(PORT, () => {
    console.log(`server is listening at ${PORT}`);
});

