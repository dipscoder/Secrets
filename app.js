// * Level-3 ---> Hashing and Salting With bcrypt

require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const app = express()

app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended : true}))
app.set('view engine','ejs')


mongoose.connect("mongodb://localhost/userDB" , {useNewUrlParser:true , useUnifiedTopology: true})
// console.log(md5('123456'));

const userSchema = new mongoose.Schema({
    email : String,
    password : String
})

const User = new mongoose.model('User',userSchema)

app.get('/',(req,res)=>{
    res.render('home')
})
app.get('/register',(req,res)=>{
    res.render('register')
})

app.get('/login',(req,res)=>{
    res.render('login')
})

app.post('/register',(req,res)=>{



    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {        //*---> bcrypt
        // Store hash in your password DB.
        const newUser = new User({
            email : req.body.username,
            password : hash
        })

        newUser.save((err) => {
            if (err) {
                console.log(err);       
            } else {
                res.render('secrets')
            }
        })
    }); 



})

app.post('/login',(req,res) => {

    const username = req.body.username
    const password = req.body.password 

    User.findOne({email : username} , (err,foundUser) => {
        if (err) {
            console.log(err);
        } else {
            if (foundUser) {
                
                bcrypt.compare(password, foundUser.password, function(err, result) {  //*--->bcrypt
                    // result == true
                    if (result === true) {
                        res.render('secrets')
                    } else {
                        console.log("Wrong credential!");
                    }
                });

            } 
        }
    })
})

app.listen(3000,(req,res)=>{
    console.log("Server started at port 3000");
})