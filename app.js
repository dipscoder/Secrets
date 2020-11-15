// * Level-1 ---> Storing the User's Credentials into the DataBase in the String Format

const express = require('express')
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');

const app = express()

app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended : true}))
app.set('view engine','ejs')


mongoose.connect("mongodb://localhost/userDB" , {useNewUrlParser:true , useUnifiedTopology: true})

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
        password : req.body.password
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
    const password = req.body.password

    User.findOne({email : username} , (err,foundUser) => {
        if (err) {
            console.log(err);
        } else {
            if (foundUser) {
                if (foundUser.password === password) {
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