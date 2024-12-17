const db = require('../utils/database')

const getAllHotels = async (req, res) => {
    try {
        const connection = await db.getConnection()

        const page = parseInt(req.query.page) || 1 
        const limit = 5 

        const [hotelResult, countResult] = await Promise.all([
            connection.execute(
                `SELECT * FROM hotels ORDER BY hotel_id`,
            ),
            connection.execute(`SELECT COUNT(*) AS count FROM hotels`)
        ])

        const allHotels = hotelResult.rows
        const totalHotels = countResult.rows[0][0]
        const totalPages = Math.ceil(totalHotels / limit)

        let hotels = []

        allHotels.forEach((hotel, key) => {
            if(key < page * limit && key + 1 > (page - 1) * limit)
                hotels.push(hotel)
        })

        res.render('hotels', { 
            hotels, 
            totalPages, 
            currentPage: page 
        })

    } catch (error) {
        res.status(500).render('error', { message: "Błąd serwera", code: 500 })
    }
}


const getHotelById = async (req, res) => {
    const { id } = req.params

    try {
        const connection = await db.getConnection()

        const hotelResult = await connection.execute(
            `SELECT * FROM hotels WHERE hotel_id = :id`,
            [id]
        )

        const roomsResult = await connection.execute(
            `SELECT * FROM rooms WHERE hotel_id = :id`,
            [id]
        )

        let hotel = hotelResult.rows[0]
        let rooms = roomsResult.rows
        
        if(hotel) {
            res.render('hotel', {hotel, rooms})
        } else {
            res.render('error', { message: "Hotel nie znaleziony", code: 404})
        }

        
    } catch (err) {
        console.error("Błąd podczas pobierania danych hotelu z pokojami:", err)
        res.status(500).render('error', { message: "Błąd serwera", code: 500 })
    }
}

const createHotel = async(req, res) => {
    const { name, location, rating } = req.body

    try {
        const connection = await db.getConnection()

        await connection.execute(
            `INSERT INTO hotels (name, location, rating) 
             VALUES (:name, :location, :rating)`,
            [name, location, rating],
            { autoCommit: true } 
        )

        res.redirect('/hotels')
    } catch (err) {
        console.error("Błąd podczas tworzenia hotelu:", err)
        res.status(500).render('error', { message: "Błąd serwera podczas tworzenia hotelu", code: 500 })
    }

}

const updateHotel = async (req, res) => {
    const { id } = req.params 
    const { name, location, rating } = req.body

    try {
        const connection = await db.getConnection()

        await connection.execute(
            `UPDATE hotels 
             SET name = :name, location = :location, rating = :rating 
             WHERE hotel_id = :id`,
            [name, location, rating, id],
            { autoCommit: true } 
        )

        res.redirect(`/hotels/${id}`) 
    } catch (err) {
        console.error("Błąd podczas aktualizacji hotelu:", err)
        res.status(500).render('error', { message: "Błąd serwera podczas aktualizacji hotelu", code: 500 })
    }
}

const deleteHotel = async (req, res) => {
    const { id } = req.params 

    try {
        const connection = await db.getConnection()

        const result = await connection.execute(
            `DELETE FROM hotels WHERE hotel_id = :id`,
            [id],
            { autoCommit: true } 
        )

        if (result.rowsAffected === 0) {
            return res.status(404).render('error', { message: "Hotel nie znaleziony", code: 404 })
        }

        res.redirect('/hotels')
    } catch (err) {
        console.error("Błąd podczas usuwania hotelu:", err)
        res.status(500).render('error', { message: "Błąd serwera podczas usuwania hotelu, upewnij się że hotel nie posiada pokoi", code: 500 })
    }
}

module.exports = {
    getAllHotels,
    getHotelById,
    createHotel,
    updateHotel,
    deleteHotel,
}