const db = require('../../utils/database')

const getAllHotels = async (req, res) => {
    res.render('hotels')
}

module.exports = {
    getAllHotels
}