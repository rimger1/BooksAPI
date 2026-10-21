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


// get specific loan
router.get('/:id', (req,res)=>{
    const loanId = req.params.id
    if(!loanId){
        return res.status(400).json({error: "Missing required fields"})
    }
    db.query('SELECT * FROM loans WHERE id = ?', [loanId], (err,results)=>{
        if(err){
            return res.status(500).json({error: err})
        }
        if(results.length === 0) {
            return res.status(404).json({error: 'Loan not found'})
        }
        return res.status(200).json(results[0])
    })
})


//post new loan
router.post('/', (req,res)=>{
    const {book_id, reader_id, loan_date, return_date} = req.body
    if(!book_id || !reader_id || !loan_date || !return_date)
    {
        return res.status(400).json({error: "Missing required fields"})
    }
    if(new Date(loan_date) > new Date(return_date)){
        return res.status(400).json({error: "Loan date cannot be after return date"})
    }
    db.query('SELECT * FROM books WHERE id = ?', [book_id], (err, results)=>{
        if(err){
            return res.status(500).json({error: err})
        }
        if(results.length === 0) {
            return res.status(404).json({error: 'Book not found'})
        }
        db.query('SELECT * FROM readers WHERE id = ?', [reader_id], (err, results)=>{
            if(err){
                return res.status(500).json({error: err})
            }
            if(results.length === 0) {
                return res.status(404).json({error: 'Reader not found'})
            }
            db.query('select * from books where id = ? and available = 1', [book_id], (err, results)=>{
                if(err){
                    return res.status(500).json({error: err})
                }
                if(results.length == 0){
                    return res.status(409).json({error: 'Book is already loaned out'})
                }
                db.query(`INSERT INTO loans (book_id, reader_id, loan_date, return_date) VALUES (?, ?, ?, ?);
                    UPDATE books SET available = 0 WHERE id = ${book_id}`, [book_id, reader_id, loan_date, return_date], (err, results)=>{
                    if(err){
                        return res.status(500).json({error: err})
                    }
                    if(results[0].affectedRows === 0){
                        return res.status(409).json({error: 'Failed to create loan'})
                    }
                    return res.status(201).json({message: 'Loan created'})
                })
            })
        })
    })
})


// put update loan
router.put('/:id', (req,res)=>{
    const loanId = req.params.id
    const {book_id, reader_id, loan_date, return_date} = req.body
    if(!loanId || !book_id || !reader_id || !loan_date || !return_date)
    {
        return res.status(400).json({error: "Missing required fields"})
    }
    db.query('SELECT * FROM loans WHERE id = ?', [loanId], (err, results)=>{
        if(err){
            return res.status(500).json({error: err})
        }
        if(results.length === 0) {
            return res.status(404).json({error: 'Loan not found'})
        }
        db.query('UPDATE loans SET book_id = ?, reader_id = ?, loan_date = ?, return_date = ? WHERE id = ?', [book_id, reader_id, loan_date, return_date, loanId], (err,results)=>{
            if(err){
                return res.status(500).json({error: err})
            }
            if(results.affectedRows === 0){
                return res.status(404).json({error: "Loan not found"})
            }
            return res.status(200).json({message: "Loan updated successfully"})
        })
    })
})

// delete loan
router.delete('/:id', (req,res)=>{
    const loanId = req.params.id
    if(!loanId){
        return res.status(400).json({error: "Missing required fields"})
    }
    db.query('SELECT * FROM loans WHERE id = ?', [loanId], (err, results)=>{
        if(err){
            return res.status(500).json({error: err})
        }
        if(results.length === 0) {
            return res.status(404).json({error: 'Loan not found'})
        }
        const bookId = results[0].book_id
        db.query(`DELETE FROM loans WHERE id = ?; UPDATE books SET available = 1 WHERE id = ?`, [loanId,bookId], (err, results)=>{
            if(err)
            {
                return res.status(500).json({error: err})
            }
            if(results[0].affectedRows === 0){
                return res.status(404).json({error: 'Loan not found'})
            }
            return res.status(200).json({message: 'Loan deleted'})
        })
    })
})

// return book
router.post('/:id/return', (req,res)=>{
    const loanId = req.params.id
    if(!loanId){
        return res.status(400).json({error: "Missing required fields"})
    }
    db.query('SELECT * FROM loans WHERE id = ?', [loanId], (err, results)=>{
        if(err){
            return res.status(500).json({error: err})
        }
        if(results.length === 0) {
            return res.status(404).json({error: 'Loan not found'})
        }
        const bookId = results[0].book_id
        db.query(`UPDATE loans SET return_date = NOW() WHERE id = ?; UPDATE books SET available = 1 WHERE id = ?`, [loanId,bookId], (err, results)=>{
            if(err)
            {
                return res.status(500).json({error: err})
            }
            if(results[0].affectedRows === 0){
                return res.status(404).json({error: 'Loan not found'})
            }
            return res.status(200).json({message: 'Book returned'})
        })
    })
})





module.exports = router