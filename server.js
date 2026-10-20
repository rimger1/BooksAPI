require('dotenv').config()
const express = require('express')
const cors = require('cors')

const booksroutes = require('./routes/books.routes')
const readersroutes = require('./routes/readers.routes')
const loansroutes = require('./routes/loans.routes')
const app = express()

//middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended:true}))




app.use('/api/books', booksroutes)
app.use('/api/readers', readersroutes)
app.use('/api/loans', loansroutes)

app.listen(process.env.APP_PORT, () =>{
    console.log(`server on http://localhost:${process.env.APP_PORT}`)
})