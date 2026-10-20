require('dotenv').config()
const express = require('express')
const cors = require('cors')

const tableroutes = require('./modules/tables_ops')
const emailroutes = require('./modules/email_ops')
const fileroutes = require('./modules/file_ops')
const authroutes = require('./modules/auth_ops')
const app = express()

//middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended:true}))




app.use('/', tableroutes)
app.use('/email', emailroutes)
app.use('/file', fileroutes)
app.use('/auth', authroutes)

app.listen(process.env.APP_PORT, () =>{
    console.log(`server on http://localhost:${process.env.APP_PORT}`)
})