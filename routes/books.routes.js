const express = require('express')
const router = express.Router()
var db = require('../config/database')


// Get all books
router.get('/', (req, res) => {
    db.query('SELECT * FROM books', (err, results) => {
        if(err) {
            return res.status(500).json({err})
        }
        return res.status(200).json(results)
    })
})

// Get a specific book by ID
router.get('/:id', (req, res) => {
    const bookId = req.params.id
    if(!bookId){
        return res.status(400).json({error: "Missing required fields"})
    }
    db.query('SELECT * FROM books WHERE id = ?', [bookId], (err, results) => {
        if(err) {
            return res.status(500).json({error: err})
        }
        if(results.length === 0) {
            return res.status(404).json({error: 'Book not found'})
        }
        return res.status(200).json(results[0])
    })
})

// Create a new book
router.post('/', (req, res) => {
    const {title, author, category, publish_year} = req.body
    if(!title || !author || !category || !publish_year){
        return res.status(400).json({error: "Missing required fields"})
    }
    db.query('INSERT INTO books (title, author, category, publish_year) VALUES (?, ?, ?, ?)', [title, author, category, publish_year], (err, results) => {
        if(err) {
            return res.status(500).json({error: err})
        }
        return res.status(201).json({message: 'Book created'})
    })
})

// Update book
router.put('/:id', (req, res)=>{
    const bookId = req.params.id
    const {title, author, category, publish_year} = req.body
    if(!title || !author || !category || !publish_year || !bookId){
        return res.status(400).json({error: "Missing required fields"})
    }
    db.query('UPDATE books SET title = ?, author = ?, category = ?, publish_year = ? WHERE id = ?', [title, author, category, publish_year, bookId], (err, results) => {
        if(err) {
            return res.status(500).json({err})
        }
        if(results.affectedRows === 0) {
            return res.status(404).json({err: 'Book not found'})
        }
        return res.status(200).json({message: "Book updated successfuly"})
    })
})

// Delete book
router.delete('/:id', (req,res)=>{
    const bookId = req.params.id
    if(!bookId){
        return res.status(400).json({error: "Missing required fields"})
    }
    db.query('SELECT book_id FROM loans WHERE book_id= ?', [bookId], (err, results)=>{
        if(err){
            return res.status(500).json({error: err})
        }
        if(results.length > 0){
            return res.status(400).json({error: "Cannot delete book with active loans"})
        }
        db.query('DELETE FROM books WHERE id = ?', [bookId], (err, results) => {
            if (err){
                return res.status(500).json({error: err})
            }
            if(results.affectedRows === 0){
                return res.status(404).json({error: 'Book not found'})
            }
            return res.status(200).json({message: 'Book deleted'})
        })
    })
})











module.exports = router