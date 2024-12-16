const oracledb = require('oracledb')

let connection

async function initOracleClient() {
    try {
        oracledb.initOracleClient({
            libDir: 'C:\\Users\\Vigz\\Desktop\\oracleinstant',
        })
        console.log("Oracle Instant Client initialized!")
    } catch (err) {
        console.error("Error initializing Oracle Client: ", err)
        throw err
    }
}

async function connectToDatabase() {
    try {
        connection = await oracledb.getConnection({
            user: process.env.DB_USER,         
            password: process.env.DB_PASSWORD,     
            connectString: process.env.DB_CONNECTION_STRING,
        })

        console.log("Successfully connected to Oracle Database!")
        return connection
    } catch (err) {
        console.error("Error connecting to Oracle Database: ", err)
        throw err
    }
}

function getConnection() {
    if (!connection) {
        throw new Error("Database connection has not been initialized.")
    }

    return connection
}

module.exports = {
  initOracleClient,
  connectToDatabase,
  getConnection,
}