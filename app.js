// * Level-5 ---> Cookies and Session
// * Pasport ---> http://www.passportjs.org/
require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const session = require('express-session')
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const { Passport } = require('passport');

const app = express()

app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended : true}))
app.set('view engine','ejs')

app.use(session({
    secret: "Our little secret. ",      // TODO Put this in an env file afterwards
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())

mongoose.connect("mongodb://localhost/userDB" , {useNewUrlParser:true , useUnifiedTopology: true})
mongoose.set('useCreateIndex', true);
// console.log(md5('123456'));

const userSchema = new mongoose.Schema({
    email : String,
    password : String
})
userSchema.plugin(passportLocalMongoose)

const User = new mongoose.model('User',userSchema)

passport.use(User.createStrategy());
 
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get('/',(req,res)=>{
    res.render('home')
})
app.get('/register',(req,res)=>{
    res.render('register')
})

app.get('/login',(req,res)=>{
    res.render('login')
})

app.get('/logout',(req,res)=>{
    req.logout();
    res.redirect('/');
})

app.get('/secrets' , (req,res)=>{
     if (req.isAuthenticated()) {
         res.render('secrets')
     } else {
         res.redirect('/login')
     }
})

app.post('/register',(req,res)=>{

    User.register({username : req.body.username} , req.body.password , function(err,user) {
        if (err) {
            console.log(err);
            res.redirect('/')
        } else {
            passport.authenticate('local')(req,res,function() {
                res.redirect('/secrets')
            })
        }
    })
})

app.post('/login',(req,res) => {
    // imp Problem - Whenever req.login() gets executed a cookie gets created even if i enter wrong password.Even though it displays unauthorized page i can access /secrets route without being redirected to login page
    // imp Link - https://www.udemy.com/course/the-complete-web-development-bootcamp/learn/lecture/13559534#questions/13061428
    // const user = new User({
    //     username : req.body.username,
    //     password : req.body.password 
    // })

    // req.login(user,function(err){
    //     if (err) {
    //         console.log(err);
    //     } else {
    //         passport.authenticate('local')(req,res,function() {
    //             res.redirect('/secrets')
    //         })
    //     }
    // })
    // imp Solution - https://www.udemy.com/course/the-complete-web-development-bootcamp/learn/lecture/13559534#questions/12462002
    passport.authenticate('local', { successRedirect: '/secrets',
    failureRedirect: '/login',
    failureFlash: true })(req,res)
})

app.listen(3000,(req,res)=>{
    console.log("Server started at port 3000");
})