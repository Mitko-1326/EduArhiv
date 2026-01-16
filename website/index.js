const express = require("express");
require("dotenv").config();
const basicAuth = require('express-basic-auth');  // ← Move to top
const session = require('express-session');  // ← Move to top

const app = express();
const port = 3000;
const API_KEY = process.env.API_KEY;
const API_URL = process.env.API_URL || 'http://api.eduarhiv.com';

// STEP 1: Set up body parsing FIRST
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// STEP 2: Set up session
app.use(session({
  secret: 'your-secret-key-change-this', 
  resave: false,  
  saveUninitialized: false,  
  cookie: { 
    maxAge: 24 * 60 * 60 * 1000,  
    httpOnly: true, 
    secure: false  
  }
}));

// STEP 3: Password protection (optional)
if (process.env.BASIC_AUTH_PASSWORD) {
  app.use(basicAuth({
    users: { 'demo': process.env.BASIC_AUTH_PASSWORD },
    challenge: true,
    realm: 'EduArhiv Demo'
  }));
}

// STEP 4: Static files
app.use(express.static('public'));

// STEP 5: NOW set up routes (including auth)
require('./auth')(app, API_KEY);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.get("/login", (req, res) => {
  res.sendFile(__dirname + "/public/login/login.html");
});

// STEP 6: Start server
app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on http://localhost:${port}`);
});