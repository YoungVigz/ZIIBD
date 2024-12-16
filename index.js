const express = require('express')
const routes = require('./src/routes/index')
const db = require('./src/utils/database')

const app = express()

const connectToDB = async () => {
    try {
      await db.initOracleClient()
      await db.connectToDatabase()
    } catch (err) {
      console.error("Failed to initialize database connection:", err)
      process.exit(1)
    }
}
connectToDB()

app.use(routes)

const PORT = process.env.PORT
app.listen(PORT, () => console.log(`Server is running at http://localhost:${PORT}`))