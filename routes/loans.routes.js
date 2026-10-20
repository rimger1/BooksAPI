const express = require('express')
const router = express.Router()
var db = require('../config/database')

// get loans
router.get('/', (req,res)=>{
    db.query('SELECT loans.*, books.title AS book_title, readers.name AS reader_name FROM loans INNER JOIN books ON loans.book_id = books.id INNER JOIN readers ON loans.reader_id = readers.id', (err, results)=>{
        if(err){
            return res.status(500).json({error: err})
        }
        return res.status(200).json(results)
    })
})









module.exports = router