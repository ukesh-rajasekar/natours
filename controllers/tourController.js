const fs = require('fs');

const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`))


//ROUTE HANDLERS
exports.getAllTours = (req, res) => {
    res.status(200).json({ status: 'success', requestedAt: req.requestedTime, results: tours.length, data: { tours } })
}

exports.getTour = (req, res) => {
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

exports.updateTour = (req, res) => {
    const id = req.params.id * 1;

    if (id > tours.length) {
        return res.status(404).json({
            status: 'fail',
            message: 'invalid id'
        })
    }

    res.status(200).json({ status: '<updated data here ...>' })
}

exports.deleteTour = (req, res) => {
    const id = req.params.id * 1;

    if (id > tours.length) {
        return res.status(404).json({
            status: 'fail',
            message: 'invalid id'
        })
    }
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
