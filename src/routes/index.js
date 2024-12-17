const express = require('express')
const router = express.Router()

const usersRoutes = require('./usersRouter')
const hotelsRoutes = require('./hotlesRouter')
const roomsRoutes = require('./roomsRouter')
const reservationsRoutes = require('./reservationsRouter')

router.get('/', (req, res) => {
    res.render('index') 
})

router.use('/users', usersRoutes)
router.use('/hotels', hotelsRoutes)
router.use('/rooms', roomsRoutes)
router.use('/reservations', reservationsRoutes)

module.exports = router