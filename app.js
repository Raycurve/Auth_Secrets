//jshint esversion:6
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
// const encrypt = require('mongoose-encryption');
const app = express();
const md5 = require('md5');
require("dotenv").config();

app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));

mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema = new mongoose.Schema({
  username:{
    type:String,
    required:[true,"username required"]
  },
  password:{
    type:String,
    required:[true,"password required"]
  }
})


// userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password'] });
const User = new mongoose.model("users",userSchema);

app.get("/",(req,res)=>{
  res.render("home");
})
app.get("/login",(req,res)=>{
  res.render("login");
})
app.get("/register",(req,res)=>{
  res.render("register");
})

app.post("/register",(req,res)=>{
  // console.log(req);
  const user = req.body.username;
  const pass = md5(req.body.password);
  const newU = new User({
    username: user,
    password: pass
  })
  newU.save()
  .then(()=>{
    //to do add a notif of registered succesfully
    console.log("registered succesfully!");
    res.redirect("/")
  })
  .catch((err)=>{
    console.log(err);
    res.redirect("/register")
  })

})

app.post("/login",(req,res)=>{
  const user = req.body.username;
  const pass = md5(req.body.password);
  User.findOne({username: user})
  .then((user)=>{
    if(user == null){
      console.log("user not found");
      res.redirect("/login");
    }
    else if(user.password === pass){
      res.render("secrets");
    }
    else{
      console.log("wrong credentials!");
      res.redirect("/login")
    }
  })
  .catch((err)=>{
    console.log(err);
    res.redirect("/login");
  })
})
app.listen(3000,()=>{
  console.log("vroooooooooom on 3000");
})
