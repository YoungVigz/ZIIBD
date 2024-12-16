const express = require('express')
const router = express.Router()

const db = require('../utils/database')

router.get('/', async (req, res) => {
    try {
        const connection = db.getConnection() 
        const result = await connection.execute(
          `SELECT first_name, last_name FROM students`
        )
    
        res.send(result.rows) 
    } catch (err) {
        console.error("Error fetching students: ", err)
        res.status(500).send("Internal Server Error")
    }
})

module.exports = router