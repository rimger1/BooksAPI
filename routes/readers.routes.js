const express = require('express')
const router = express.Router()
var db = require('../config/database')


// get all readers
router.get('/', (req,res)=>{
    db.query('SELECT * FROM readers', (err, results)=>{
        if(err){
            return res.status(500).json({error: err})
        }
        return res.status(200).json(results)
    })
})

// get specific reader by id
router.get('/:id', (req,res)=>{
    const readerId = req.params.id
    if(!readerId){
        return res.status(400).json({error: "Missing required fields"})
    }
    db.query('SELECt * FROM readers WHERE id = ?', [readerId], (err, results)=>{
        if(err){
            return res.status(500).json({error: err})
        }
        if(results.length === 0) {
            return res.status(404).json({error: 'Reader not found'})
        }
        return res.status(200).json(results[0])
    })
})

// POST new reader
router.post('/', (req,res)=>{
    const {name, email, phone} = req.body
    if(!name || !email || !phone)
    {
        return res.status(400).json({error: "Missing required fields"})
    }
    db.query('INSERT INTO readers (name, email, phone) VALUES (?, ?, ?)', [name, email, phone], (err, results)=>{
        if(err){
            return res.status(500).json({error: err})
        }
        if(results.affectedRows === 0){
            return res.status(409).json({error: 'Failed to create reader'})
        }
        return res.status(201).json({message: 'Reader created'})
    })
})


// UPDATE reader
router.put('/:id', (req,res)=>{
    const readerId = req.params.id
    const {name, email, phone} = req.body
    if(!readerId || !name || !email || !phone)
    {
        return res.status(400).json({error: "Missing required fields"})
    }
    db.query('UPDATE readers SET name = ?, email = ?, phone = ? WHERE id = ?', [name, email, phone,readerId], (err,results)=>{
        if(err){
            return res.status(500).json({error: err})
        }
        if(results.affectedRows === 0){
            return res.status(404).json({error: "Reader not found"})
        }
        return res.status(200).json({message: "Reader updates succesfuly"})
    })
})


// delete reader
router.delete('/:id', (req,res)=>{
    const readerId = req.params.id
    if(!readerId){
        return res.status(400).json({error: "Missing required fields"})
    }
    db.query('SELECT reader_id FROM loans WHERE reader_id= ?', [readerId], (err, results)=>{
        if(err){
            return res.status(500).json({error: err})
        }
        if(results.length > 0){
            return res.status(400).json({error: "Cannot delete reader with active loans"})
        }
        db.query('DELETE FROM readers WHERE id = ?', [readerId], (err, results) => {
            if (err){
                return res.status(500).json({error: err})
            }
            if(results.affectedRows === 0){
                return res.status(404).json({error: 'Reader not found'})
            }
            return res.status(200).json({message: 'Reader deleted'})
        })
    })
})








module.exports = router