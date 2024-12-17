const express = require('express')
const router = express.Router()

const usersRoutes = require('./usersRouter')
const hotelsRoutes = require('./hotlesRouter')
const roomsRoutes = require('./roomsRouter')

router.get('/', (req, res) => {
    res.render('index') 
})

router.use('/users', usersRoutes)
router.use('/hotels', hotelsRoutes)
router.use('/rooms', roomsRoutes)

module.exports = router