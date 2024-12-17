const db = require('../utils/database')

const getAllReservations = async (req, res) => {
    try {
        const connection = await db.getConnection()

        const reservationsResult = await connection.execute(`
            SELECT r.reservation_id, u.name, h.name, ro.room_type, r.start_date, r.end_date, r.total_price 
            FROM reservations r
            JOIN users u ON r.user_id = u.user_id
            JOIN rooms ro ON r.room_id = ro.room_id
            JOIN hotels h ON h.hotel_id = ro.hotel_id
        `)

        const usersResult = await connection.execute(`SELECT user_id, name FROM users`)    
        const availableRoomsResult = await connection.execute(`SELECT room_id, room_type, price FROM rooms WHERE availability = 1`)

        res.render('reservations', {
            reservations: reservationsResult.rows,
            users: usersResult.rows,
            availableRooms: availableRoomsResult.rows
        })

    } catch (err) {
        console.error("Błąd podczas pobierania danych rezerwacji:", err)
        res.status(500).render('error', { message: "Błąd serwera", code: 500 })
    }
}

const getReservationById = async (req, res) => {
    const { id } = req.params

    try {
        const connection = await db.getConnection()
        const result = await connection.execute(
            `SELECT * FROM reservations WHERE reservation_id = :id`,
            [id]
        )

        const usersResult = await connection.execute(`SELECT user_id, name FROM users`) 
        const availableRoomsResult = await connection.execute(`SELECT room_id, room_type, price, AVAILABILITY FROM rooms`)  

        const reservation = result.rows[0]
        const users = usersResult.rows
        const rooms = availableRoomsResult.rows

        if (reservation) {
            res.render('reservation', { reservation, users, rooms })
        } else {
            res.status(404).render('error', { message: "Rezerwacja nie znaleziona", code: 404 })
        }
    } catch (err) {
        console.error('Błąd podczas pobierania rezerwacji:', err)
        res.status(500).render('error', { message: "Błąd serwera", code: 500 })
    }
}


const createReservation = async (req, res) => {
    const { user_id, room_id, start_date, end_date } = req.body

    try {
        const connection = await db.getConnection()
        
        const roomResult = await connection.execute(
            `SELECT availability FROM rooms WHERE room_id = :room_id`,
            [room_id]
        )

        const room = roomResult.rows[0]

        if (!room || room[0] === 0) {
            return res.status(400).render('error', { message: 'Pokój jest już niedostępny', code: 400 })
        }

        await connection.execute(
            `INSERT INTO reservations ( user_id, room_id, start_date, end_date, total_price, status)
             VALUES ( :user_id, :room_id, TO_DATE(:start_date, 'YYYY-MM-DD'), TO_DATE(:end_date, 'YYYY-MM-DD'), 
                     (SELECT price FROM rooms WHERE room_id = :room_id) * (TO_DATE(:end_date, 'YYYY-MM-DD') - TO_DATE(:start_date, 'YYYY-MM-DD')), 
                     'Confirmed')`,
            [user_id, room_id, start_date, end_date, room_id, end_date, start_date]
        )

        await connection.execute(
            `UPDATE rooms SET availability = 0 WHERE room_id = :room_id`,
            [room_id]
        )

        await connection.commit()

        res.redirect('/reservations')
    } catch (err) {
        console.error('Błąd podczas dodawania rezerwacji:', err)
        res.status(500).render('error', { message: 'Błąd serwera', code: 500 })
    }
}

const updateReservation = async (req, res) => {
    const { id } = req.params
    const { user_id, room_id, start_date, end_date, old_room_id } = req.body

    try {
        const connection = await db.getConnection()

        if(old_room_id != room_id) {
            const result = await connection.execute(
                `SELECT availability FROM rooms WHERE room_id = :room_id`,
                { room_id }
            )

            if(result.rows[0] == 0) {
                res.render('error', { message: "Ten pokój jest już zajęty", code: 400})
                return
            }

            await connection.execute(
                `UPDATE rooms
                 SET availability = 1
                 WHERE room_id = :old_room_id`,
                { old_room_id }
            )

            await connection.execute(
                `UPDATE rooms
                SET availability = 0
                WHERE room_id = :room_id`,
               { room_id }
            )
        }
        
        
        await connection.execute(
            `UPDATE reservations
             SET user_id = :user_id,
                 room_id = :room_id,
                 start_date = TO_DATE(:start_date, 'YYYY-MM-DD'),
                 end_date = TO_DATE(:end_date, 'YYYY-MM-DD'),
                 total_price = (SELECT price FROM rooms WHERE room_id = :room_id) * (TO_DATE(:end_date, 'YYYY-MM-DD') - TO_DATE(:start_date, 'YYYY-MM-DD'))
             WHERE RESERVATION_ID = :id`,
            { user_id, room_id, start_date, end_date, room_id, end_date, start_date, id }
        )

        await connection.commit()

        res.redirect(`/reservations/${id}`)
    } catch (err) {
        console.error('Błąd podczas aktualizacji rezerwacji:', err)
        res.status(500).render('error', { message: "Błąd serwera", code: 500 })
    }
}

const deleteReservation = async (req, res) => {
    const { id } = req.params

    try {
        const connection = await db.getConnection()

        const reservationResult = await connection.execute(
            `SELECT room_id FROM reservations WHERE reservation_id = :id`,
            [id]
        )

        const reservation = reservationResult.rows[0]

        if (!reservation) {
            return res.status(404).render('error', { message: 'Rezerwacja nie istnieje', code: 404 })
        }

        const roomId = reservation[0]

        await connection.execute(
            `DELETE FROM reservations WHERE reservation_id = :id`,
            [id]
        )

        await connection.execute(
            `UPDATE rooms SET availability = 1 WHERE room_id = :roomId`,
            [roomId]
        )

        await connection.commit()

        res.redirect('/reservations') 
    } catch (err) {
        console.error('Błąd podczas usuwania rezerwacji:', err)
        res.status(500).render('error', { message: 'Błąd serwera', code: 500 })
    }
}

module.exports = {
    getAllReservations,
    getReservationById,
    createReservation,
    updateReservation,
    deleteReservation
}

