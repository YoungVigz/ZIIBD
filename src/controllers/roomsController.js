const db = require('../utils/database')

const getRoomById = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10)

        if (isNaN(id)) {
            res.render('error', {message: "Wprowadź poprawne id pokoju", code: 400})
            return
        }

        const connection = await db.getConnection()
        const data = await connection.execute(
            `SELECT * FROM rooms WHERE room_id = ${id}`,
        )

        const room = data.rows[0]

        if (room) {
            res.render('room', { room })
        } else {
            res.render('error', { code: 404,  message: 'Użytkownik nie istnieje ' })
        }

    } catch (err) {
        res.render('error', { code: 500,  message: 'Błąd serwera' })
    }
}

const createRoom = async (req, res) => {
    const { room_type, price, availability, hotel_id } = req.body

    try {
        const connection = await db.getConnection()

        await connection.execute(
            `INSERT INTO rooms (room_id, hotel_id, room_type, price, availability) 
             VALUES (rooms_seq.NEXTVAL, :hotel_id, :room_type, :price, :availability)`,
            [hotel_id, room_type, price, availability],
            { autoCommit: true }
        )

        res.redirect(`/hotels/${hotel_id}`)
    } catch (err) {
        console.error("Błąd podczas tworzenia pokoju:", err)
        res.status(500).render('error', { message: "Błąd serwera podczas dodawania pokoju", code: 500 })
    }
}


const updateRoom = async (req, res) => {
    const { id } = req.params
    const { room_type, price, availability } = req.body

    try {
        const connection = await db.getConnection()

        await connection.execute(
            `UPDATE rooms 
            SET room_type = :room_type, price = :price, availability = :availability
            WHERE room_id = :id`,
            [room_type, price, availability, id],
            { autoCommit: true }
        )

        res.redirect(`/rooms/${id}`)
    } catch (err) {
        console.error("Błąd podczas aktualizacji pokoju:", err)
        res.status(500).render('error', { message: "Błąd serwera podczas aktualizacji pokoju", code: 500 })
    }
}


const deleteRoom = async (req, res) => {
    const { id } = req.params
    const { hotel_id } = req.body

    try {
        const connection = await db.getConnection()

        await connection.execute(
            `DELETE FROM rooms WHERE room_id = :id`,
            [id],
            { autoCommit: true }
        )

        res.redirect(`/hotels/${hotel_id}`)
    } catch (err) {
        res.status(500).render('error', { message: "Błąd serwera podczas usuwania pokoju", code: 500 })
    }
}

module.exports = {
    getRoomById,
    createRoom,
    updateRoom,
    deleteRoom
}