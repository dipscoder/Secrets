// require('dotenv').config()
// const passport = require('passport');
// const FacebookStrategy = require('passport-facebook').Strategy;
// var findOrCreate = require('mongoose-findorcreate')

// passport.use(new FacebookStrategy({
//     clientID: "process.env.FACEBOOK_APP_ID",
//     clientSecret: "process.env.FACEBOOK_APP_SECRET",
//     callbackURL: "http://localhost:8000/auth/facebook/secrets"
//  },

//  function(accessToken, refreshToken, profile, cb) {
//    console.log(profile);
//     User.findOrCreate({ facebookId: profile.id }, function (err, user) {
//       return cb(err, user);
//     });
//   }
// ));