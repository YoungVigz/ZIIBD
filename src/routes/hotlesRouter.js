const express = require('express')
const router = express.Router()

const { getAllHotels, getHotelById, createHotel, updateHotel, deleteHotel } = require('../controllers/hotelsController')

router.get('/', getAllHotels)
router.get('/:id', getHotelById)
router.post('/', createHotel)
router.put('/:id', updateHotel)
router.delete('/:id', deleteHotel)

module.exports = router