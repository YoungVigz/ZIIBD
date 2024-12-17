const express = require('express')
const router = express.Router()

const { getAllReservations, getReservationById, createReservation, updateReservation, deleteReservation } = require('../controllers/reservationsController')

const { checkDate } = require('../utils/middlewares')

router.get('/', getAllReservations)
router.get('/:id', getReservationById)
router.post('/', checkDate, createReservation)
router.put('/:id', checkDate, updateReservation)
router.delete('/:id', deleteReservation)

module.exports = router