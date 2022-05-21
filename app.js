const express = require('express');
const fs = require('fs');
const morgan = require('morgan')

const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`))
const app = express();


//MIDDLEWARES 
app.use(express.json());

app.use((req, res, next) => {
    console.log('hello from the server');
    req.requestedTime = new Date().toISOString();
    next()
})

const PORT = 3000;






//ROUTE HANDLERS
const getAllTours = (req, res) => {
    res.status(200).json({ status: 'success', requestedAt: req.requestedTime, results: tours.length, data: { tours } })
}

const getTour = (req, res) => {
    const id = req.params.id * 1;

    if (id > tours.length) {
        return res.status(404).json({
            status: 'fail',
            message: 'invalid id'
        })
    }

    const tour = tours.find(ele => ele.id === id)


    res.status(200).json({ status: 'success', data: { tour: tour } })
}

const updateTour = (req, res) => {
    const id = req.params.id * 1;

    if (id > tours.length) {
        return res.status(404).json({
            status: 'fail',
            message: 'invalid id'
        })
    }

    res.status(200).json({ status: '<updated data here ...>' })
}

const deleteTour = (req, res) => {
    const id = req.params.id * 1;

    if (id > tours.length) {
        return res.status(404).json({
            status: 'fail',
            message: 'invalid id'
        })
    }
    res.status(204).json({ status: 'success', data: null })
}


const createTour = (req, res) => {
    const newId = tours[tours.length - 1].id + 1;
    const newTour = Object.assign({ id: newId }, req.body)
    tours.push(newTour)
    fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
        res.status(201).json({
            status: "success",
            data: {
                tour: newTour
            }
        })
    })
}

//ROUTES
app.get('/api/v1/tours', getAllTours)
app.get('/api/v1/tours/:id', getTour)
app.patch('/api/v1/tours/:id', updateTour)
app.delete('/api/v1/tours/:id', deleteTour)
app.post('/api/v1/tours', createTour)



//START SERVER
app.listen(PORT, () => {

    console.log(`server is listening at ${PORT}`)

})