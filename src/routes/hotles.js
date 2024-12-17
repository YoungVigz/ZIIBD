const express = require('express')
const router = express.Router()

const { getAllHotels } = require('../controllers/hotels')

router.get('/', getAllHotels)

module.exports = router