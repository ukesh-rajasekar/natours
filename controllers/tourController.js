const fs = require('fs');

const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`))

exports.checkID = (req, res, next, val) => {
    console.log(`tour function called with id: ${val}`)
    const id = req.params.id * 1;
    if (id > tours.length) {
        return res.status(404).json({
            status: 'fail',
            message: 'invalid id'
        })
    }
    next();
}

exports.checkBody = (req, res, next) => {
    console.log(`tour create function called`)
    const { body } = req;

    if (body.name === undefined || body.price === undefined) {
        return res.status(400).json({
            status: 'fail',
            message: 'price and name is required'
        })
    }
    next();
}

//ROUTE HANDLERS
exports.getAllTours = (req, res) => {
    res.status(200).json({ status: 'success', requestedAt: req.requestedTime, results: tours.length, data: { tours } })
}

exports.getTour = (req, res) => {
    const id = req.params.id * 1;
    const tour = tours.find(ele => ele.id === id)


    res.status(200).json({ status: 'success', data: { tour: tour } })
}

exports.updateTour = (req, res) => {
    const id = req.params.id * 1;
    res.status(200).json({ status: '<updated data here ...>' })
}

exports.deleteTour = (req, res) => {
    const id = req.params.id * 1;


    res.status(204).json({ status: 'success', data: null })
}


exports.createTour = (req, res) => {
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
