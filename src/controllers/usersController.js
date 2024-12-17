const db = require('../utils/database')

const getAllUsers = async (req, res) => {
    try {
        const connection = db.getConnection()

        const page = parseInt(req.query.page) || 1 
        const limit = 5 

        const [usersResult, countResult] = await Promise.all([
            connection.execute(
                `SELECT * FROM users ORDER BY user_id`,
            ),
            connection.execute(`SELECT COUNT(*) AS count FROM users`)
        ])

        const allUsers = usersResult.rows
        const totalUsers = countResult.rows[0][0]
        const totalPages = Math.ceil(totalUsers / limit)

        let users = []

        allUsers.forEach((user, key) => {
            if(key < page * limit && key + 1 > (page - 1) * limit)
                users.push(user)
        })
        
        res.render('users', { 
            users, 
            totalPages, 
            currentPage: page 
        })
    } catch (err) {
        console.error("Error fetching users: ", err)
        res.status(500).render('error', {
            code: 500,
            message: 'Wystąpił błąd podczas pobierania użytkowników.'
        })
    }
}


const createUser = async (req, res) => {
    try {
        const { name, email, phone } = req.body

        const connection = db.getConnection()
        await connection.execute(
            `INSERT INTO users (user_id, name, email, phone)
             VALUES (users_seq.NEXTVAL, :name, :email, :phone)`,
            { name, email, phone },
            { autoCommit: true }
        )

        res.redirect('/users')
    } catch (err) {
        console.error("Error adding new user: ", err)
        res.status(500).render('error', {
            code: 500,
            message: 'Nie udało się dodać nowego użytkownika. Spróbuj ponownie.'
        })
    }
}

const getUserById = async (req, res) => {
    try {

        const id = parseInt(req.params.id, 10)
        if (isNaN(id)) {
            res.status(400).send('Invalid user ID')
            return
        }

        const connection = await db.getConnection()
        const data = await connection.execute(
            `SELECT * FROM users WHERE user_id = ${id}`,
        )

        const user = data.rows[0]

        if (user) {
            res.render('user', { user })
        } else {
            res.render('error', { code: 404,  message: 'Użytkownik nie istnieje ' })
        }

    } catch (err) {
        console.error('Error fetching user: ', err)
        res.status(500).send('Internal Server Error')
    }
}

const updateUser = async (req, res) => {
    const { id } = req.params
    const { name, email, phone } = req.body

    try {
        const connection = await db.getConnection()

        const result = await connection.execute(
            `UPDATE users
             SET name = :name, email = :email, phone = :phone
             WHERE user_id = :id`,
            [name, email, phone, id],
            { autoCommit: true }
        )

        if (result.rowsAffected === 0) {
            return res.status(404).render('error', { message: "Użytkownik nie znaleziony", code: 404 })
        }

        res.redirect(`/users/${id}`)
    } catch (err) {
        res.status(500).render('error', { message: "Błąd serwera", code: 500 })
    }
}

const deleteUser = async (req, res) => {
    const { id } = req.params 
    
    try {

        const connection = await db.getConnection()
        
        const result = await connection.execute(
            `DELETE FROM users WHERE user_id = :id`,
            [id],
            { autoCommit: true }
        )
        
        if (result.rowsAffected === 0) {
            return res.status(404).render('error', { message: "Użytkownik nie został znaleziony", code: 404 })
        }

        res.redirect('/users') 
        
    } catch (err) {
        res.status(500).render('error', { message: "Błąd serwera podczas usuwania użytkownika", code: 500 })
    }
}

module.exports = {
    getAllUsers,
    createUser,
    getUserById,
    updateUser,
    deleteUser
}