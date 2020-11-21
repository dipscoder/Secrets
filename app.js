// * Level 6 - Google OAuth 2.0 Authentication
// * Pasport ---> http://www.passportjs.org/
//* Lecture ---> https://www.udemy.com/course/the-complete-web-development-bootcamp/learn/lecture/13559550#questions/13041128
// http://www.passportjs.org/packages/passport-google-oauth20/
// http://www.passportjs.org/packages/passport-facebook/
// Post- https://medium.com/swlh/node-and-passport-js-facebook-authentication-76cbfa903ff3#b2c8
// For facebook callback url - https://stackoverflow.com/questions/15036706/creating-facebook-app-with-callback-url

require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const session = require('express-session')
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
var GoogleStrategy = require('passport-google-oauth20').Strategy;
var findOrCreate = require('mongoose-findorcreate')
const FacebookStrategy = require('passport-facebook').Strategy;

const app = express()

app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended : true}))
app.set('view engine','ejs')

app.use(session({
    secret: process.env.SESSION_SECRET,      // TODO Put this in an env file afterwards
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
    password : String,
    googleId : String,
    facebookId: String,
    name : String
})
userSchema.plugin(passportLocalMongoose)
userSchema.plugin(findOrCreate)

const User = new mongoose.model('User',userSchema)

passport.use(User.createStrategy());
 

passport.serializeUser(function(user, done) {
    done(null, user.id);
});  
passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
});

//  * -------------------------------------------------------Google Strategy------------------------------------

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets"
  },
  function(accessToken, refreshToken, profile, cb) {
    // About findorCreate - https://stackoverflow.com/questions/20431049/what-is-function-user-findorcreate-doing-and-when-is-it-called-in-passport
    // https://www.npmjs.com/package/mongoose-findorcreate
    console.log(profile);
    User.findOrCreate({ name: profile.displayName ,googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

// * -------------------------------------------------------FaceBook Strategy------------------------------------

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "http://localhost:3000/auth/facebook/secrets",
 },

 function(accessToken, refreshToken, profile, cb) {
   console.log(profile);
    User.findOrCreate({ name: profile.displayName , facebookId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

app.get('/',(req,res)=>{
    res.render('home')
})

// -----------------------------------------------GOOGLE PIPELINES------------------------------------------------------

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] })
);

app.get('/auth/google/secrets', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/secrets');
});

// -----------------------------------------------FACEBOOK PIPELINES------------------------------------------------------

app.get('/auth/facebook',
  passport.authenticate('facebook')
);

app.get('/auth/facebook/secrets',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {

    res.redirect('/secrets');
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