// * Level-3 ---> Hashing With md5

require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const md5 = require('md5')

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
    const newUser = new User({
        email : req.body.username,
        password : md5(req.body.password)       //*---->md5
    })

    newUser.save((err) => {
        if (err) {
            console.log(err);       
        } else {
            res.render('secrets')
        }
    })
})

app.post('/login',(req,res) => {
    const username = req.body.username
    const password = md5(req.body.password)     //*---->md5

    User.findOne({email : username} , (err,foundUser) => {
        if (err) {
            console.log(err);
        } else {
            if (foundUser) {
                if (foundUser.password === password) {
                    // console.log(foundUser.password);
                    res.render('secrets')
                }
                else {
                    // alert("Wrong credential!")
                    console.log("Wrong credential!");
                }
            } 
        }
    })
})

app.listen(3000,(req,res)=>{
    console.log("Server started at port 3000");
})