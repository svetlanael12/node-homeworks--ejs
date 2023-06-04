const express = require('express');
const router = express.Router();
const { v4: uuid } = require('uuid');
const Book = require('../constants/Book')
const {library} = require('../constants/library')
const fileMulter = require('../middleware/upload-file')

const path = require('node:path'); 

// получить все книги
router.get('/', (req, res) => {
    const {books} = library
    res.render("book/index", {
        title: "Library",
        books: books,
    });
});

// создать книгу
router.get('/create', (req, res) => {
    res.render("book/create", {
        title: "Book | create",
        book: {},
    });
});

router.post('/create', 
    fileMulter.single('fileBook'), 
    (req, res) => {
        const {books} = library
        const {title, description, authors, favorite, fileCover, fileName} = req.body
        let fileBook
        if(req.file){
        const {path} = req.file
        fileBook = path
        }
        const newBook = new Book(title, description, authors, favorite, fileCover, fileName, fileBook)
        books.push(newBook)

        res.redirect('/books')
    }
);
// скачать книгу по ID
router.get('/download/:id', (req, res) => {
    const {books} = library;
    const {id} = req.params
    const idx = books.findIndex(el => el.id === id)
    if (idx !== -1){
      if (books[idx].fileBook.length !== 0) {
        const file = path.join(__dirname, '../' + books[idx].fileBook)
        res.download(file);
      } else {
        res.redirect('/404');
      }
    } else {
        res.redirect('/404');
    }
  })
// получить книгу по ID
router.get('/:id', (req, res) => {
    const {books} = library
    const {id} = req.params
    const idx = books.findIndex(el => el.id === id)
  
    if( idx !== -1) {
        res.render("book/view", {
            title: "Book | view",
            book: books[idx],
        });
    } else {
        res.redirect('/404');
    }
});
// редактировать книгу по ID
router.get('/update/:id', (req, res) => {
    const {books} = library
    const {id} = req.params
    const idx = books.findIndex(el => el.id === id)

    if (idx === -1) {
        res.redirect('/404');
    } 

    res.render("book/update", {
        title: "Book | view",
        book: books[idx],
    });
});
// удалить книгу по ID
router.post('/update/:id', 
    fileMulter.single('fileBook'),
    (req, res) => {
        const {books} = library
        const {title, description, authors, favorite, fileCover, fileName} = req.body
        const {id} = req.params
        const idx = books.findIndex(el => el.id === id)

        let fileBook
        if(req.file){
        const {path} = req.file
        fileBook = path
        }

        if (idx !== -1){
        books[idx] = {
            ...books[idx],
            title, 
            description, 
            authors, 
            favorite, 
            fileCover, 
            fileName,
            fileBook
        }
          res.redirect(`/books/${id}`);
        } else {
            res.redirect('/404');
        }
    }
);

router.post('/delete/:id', (req, res) => {
    const {books} = library
    const {id} = req.params
    const idx = books.findIndex(el => el.id === id)

    if (idx === -1) {
        res.redirect('/404');
    } 

    books.splice(idx, 1)
    res.redirect(`/books`);
});

module.exports = router;