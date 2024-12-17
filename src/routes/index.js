const express = require('express')
const router = express.Router()

const userRoutes = require('./users')
const hotelRoutes = require('./hotles')


router.get('/', (req, res) => {
    res.render('index') 
})

router.use('/users', userRoutes)
router.use('/hotels', hotelRoutes)

module.exports = router