const express = require('express')
const routes = require('./src/routes/index')
const db = require('./src/utils/database')
const bodyParser = require('body-parser')
const path = require('path')
const methodOverride = require('method-override')

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

app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, 'src/public')))
app.set('views', path.join(__dirname, 'src/views'))
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(routes)

const PORT = process.env.PORT
app.listen(PORT, () => console.log(`Server is running at http://localhost:${PORT}`))