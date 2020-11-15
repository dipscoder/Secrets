// * Level-2 ---> Storing the User's Credentials into the DataBase in the Encrypted form with the help of mongoose-encryption module
// * With Environment Variable (dotenv)
require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption')

const app = express()

app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended : true}))
app.set('view engine','ejs')


mongoose.connect("mongodb://localhost/userDB" , {useNewUrlParser:true , useUnifiedTopology: true})
// console.log(process.env.SAMPLE_API_KEY);

const userSchema = new mongoose.Schema({
    email : String,
    password : String
})

// https://www.npmjs.com/package/mongoose-encryption#secret-string-instead-of-two-keys
// https://www.npmjs.com/package/mongoose-encryption#encrypt-only-certain-fields

const secret = process.env.SECRET
userSchema.plugin(encrypt, {secret : secret , encryptedFields : ['password']})

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