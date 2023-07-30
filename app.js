//jshint esversion:6
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
// const encrypt = require('mongoose-encryption');
const app = express();
// const md5 = require('md5');
// const bcrypt = require('bcrypt');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

require("dotenv").config();

app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(session({
  secret:"apadipodepodepode",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema = new mongoose.Schema({
  username:{
    type:String,
    required:[true,"username required"]
  },
  password:{
    type:String,
    // required:[true,"password required"]
  },
  secret:String
})
userSchema.plugin(passportLocalMongoose);


// userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password'] });
const User = new mongoose.model("users",userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/",(req,res)=>{
  res.render("home");
})
app.get("/login",(req,res)=>{
  res.render("login");
})
app.get("/register",(req,res)=>{
  res.render("register");
})
app.get("/secrets",(req,res)=>{
  if(req.isAuthenticated()){
    User.find({"secret":{$ne:null}})
    .then((users)=>{
      res.render("secrets",{usersecrets: users});
    })
    .catch((err)=>{
      console.log(err);
      res.redirect("/login");
    })

  }else{
    res.redirect("/login");
  }
})
app.get("/logout",function(req,res){
  req.logout((err)=>{
    if(err)
      console.log(err);
    else{
      res.redirect("/");
    }
  });
})
// const saltRounds=10;
app.get("/submit",(req,res)=>{
  if(req.isAuthenticated()){
    res.render("submit");
  }else{
    res.redirect("/login");
  }
})
app.post("/submit",(req,res)=>{
  console.log(req.body.secret + req.user);
  User.findById(req.user._id)
  .then((users)=>{
    if(users){
      users.secret = req.body.secret;
      users.save()
      .then(
        res.redirect("/secrets")
      )
    }
  })
  .catch((err)=>{
    console.log(err);
    res.redirect("/secrets");
  })
  // res.render("secrets");
})
app.post("/register",(req,res)=>{
  User.register({username:req.body.username},req.body.password,(err,user)=>{
    if (err) {
        if (err.name === 'UserExistsError') {
          // Handle the case where the username is already taken
          console.log("Username already exists");
        } else {
          // Handle other registration errors
          console.log(err);
        }
        res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/secrets");
      });
    }
  });
});

app.post("/login", passport.authenticate("local"), function(req, res){
    res.redirect("/secrets");
});
   //   const user = new User({
  //     // username : req.body.username,
  //     password : req.body.password
  //   })
  //   req.login(user,function(err){
  //     if(err){
  //       console.log(err);
  //       res.redirect("/login");
  //     }
  //     else{
  //       passport.authenticate("local")(req, res, function () {
  //         res.redirect("/secrets");
  //       });
  //     }
  //   })

//
// })
app.listen(3000,()=>{
  console.log("vroooooooooom on 3000");
})
