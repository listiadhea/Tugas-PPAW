const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

const expressLayouts = require('express-ejs-layouts');
const {loadContact, findContact, addContact, cekDuplikat, deleteContact, updateContacts} = require('./utils/contacts');
const { body, validationResult, check} = require('express-validator');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');

// konfigurasi flash 
app.use(cookieParser('session'));
app.use(session({
    cookie : {maxAge : 6000},
    secret : 'secret',
    resave : true,
    saveUninitialized : true
}));

app.use(flash());

// gunakan ejs
app.set('view engine', 'ejs');

// gunakan express-ejs-layout
app.use(expressLayouts);

// Built-in middleware
app.use(express.static('public'));

app.use(express.urlencoded({extended: true}))

app.get('/', (req, res) =>{
    // res.send('Hello World');
    // res.sendFile('./index.html', { root: __dirname });
    const data = [{
        nama: "Dhea Listia Apriyanti",
        email: "dhealistia13@gmail.com"
    },
    {
        nama: "Hamada Asahi",
        email: "asahamada27@gmail.com"
    },
    {
        nama: "Annisa Lahitani",
        email: "lahitanissa10@gmail.com"
    }];

    res.render('index', {
        layout: 'layout/main-layouts',
        title: "Halaman Home",
        data,
    });
});

app.get('/about', (req, res) =>{
    // res.sendFile('./about.html', { root: __dirname });
    const data = [{
        nama: "Dhea Listia Apriyanti",
        email: "dhealistia13@gmail.com"
    },
    {
        nama: "Hamada Asahi",
        email: "asahamda27@gmail.com"
    },
    {
        nama: "Annisa Lahitani",
        email: "lahitanissa10@gmail.com"
    }];

    res.render('about', {
        layout: 'layout/main-layouts',
        title: "Halaman About",
        data,
    });
});

app.get('/contact', (req, res) =>{
    // res.sendFile('./contact.html', { root: __dirname });

    const contacts = loadContact();
    
    res.render('contact', {
        layout: 'layout/main-layouts',
        title: "Halaman Contact",
        contacts,
        msg: req.flash('msg')
    });
});

// Halaman form tambah data contact

app.get('/contact/add', (req, res) =>{
    
    res.render('add-contact', {
        layout: 'layout/main-layouts',
        title: "Halaman Detail Contact"
    });
});

// prosess data contact

app.post('/contact', [
    body('nama').custom((value) => {
        const duplikat = cekDuplikat(value);
        if(duplikat){
            throw new Error('Nama contact sudah digunakan !');
        }
        return true;
    }),
    check('email', 'Email tidak valid').isEmail(),
    check('telepon', 'Nomor Telepon Tidak Valid').isMobilePhone('id-ID')], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
    //   return res.status(400).json({ errors: errors.array() });

        res.render('add-contact',{
            layout: 'layout/main-layouts',
            title: 'Halaman Add Contact',
            errors: errors.array()
        });

    } else {
        addContact(req.body);
        // flash message 
        req.flash('msg', 'Data berhasil ditambahkan!')
        res.redirect('/contact');
    }
});


// Delete
app.get('/contact/delete/:nama', (req, res) =>{

     const data = findContact(req.params.nama);
    
     if (!data) {
        res.status(404);
        res.send('<h1>404</h1>');
     }else {
        deleteContact(req.params.nama);
        req.flash('msg', 'Data berhasil dihapus!')
        res.redirect('/contact');
     }
     
    
});
 


// Halaman form ubah data contact

app.get('/contact/edit/:nama', (req, res) =>{
    
    const data = findContact(req.params.nama);

    res.render('edit-contact', {
        layout: 'layout/main-layouts',
        title: 'Form Tambah Data Contact',
        data,
    });
});

// Proses Ubah data
app.post('/contact/update', [
    body('nama').custom((value, { req }) => {
        const duplikat = cekDuplikat(value);
        if(value !== req.body.oldNama && duplikat){
            throw new Error('Nama contact sudah digunakan !');
        }
        return true;
    }),
    check('email', 'Email tidak valid').isEmail(),
    check('telepon', 'Nomor Telepon Tidak Valid').isMobilePhone('id-ID')], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
    //   return res.status(400).json({ errors: errors.array() });

        res.render('edit-contact',{
            layout: 'layout/main-layouts',
            title: 'Halaman Ubah Data',
            errors: errors.array(),
            data: req.body,
        });

    } else {
        updateContacts(req.body);
        // flash message 
        req.flash('msg', 'Data berhasil diubah!')
        res.redirect('/contact');
    }
});


app.get('/contact/:nama', (req, res) =>{
    // res.sendFile('./contact.html', { root: __dirname });

     const data = findContact(req.params.nama);
    
    res.render('detail', {
        layout: 'layout/main-layouts',
        title: "Halaman Detail Contact",
        data
    });
});

app.use('/', (req, res) => {
    res.status(404);
    res.send('<h1> 404 : File Not Found</h1>');
});

app.listen(port, () => {
    console.log(`Server app listening at http://localhost:${port}`);
});