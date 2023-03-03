require('dotenv').config()
const express = require('express')
const { default: mongoose } = require('mongoose')
require('express-async-errors')
const cookieParser = require('cookie-parser')
const { logger } = require('./middleware/logger')
const connectDB = require('./config/dbConn')
const errorHandler = require('./middleware/errorHandler')
const corsOptions = require('./config/corsOptions')
const cors = require('cors')

const app = express()
const PORT = process.env.PORT || 3500
connectDB();

console.log(process.env.NODE_ENV)

app.use(express.json())
app.use(cookieParser())
app.use(cors(corsOptions))
app.use(logger)
app.use('/user', require('./routes/userRoute'))
app.use('/note', require('./routes/noteRoute'))
app.use('/auth', require('./routes/authRoute'))

app.all('*', (req, res) => {
    res.status(404)
    res.json("404 not found")
})


app.use(errorHandler)

mongoose.connection.once('open', () => {
    console.log("Database connected successFully")
    app.listen(PORT, () => console.log(`Server is runing on ${PORT}`))
})

mongoose.connection.on('error', (error) => {
    console.log("Mongoose Error : ", error)
})