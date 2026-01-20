const express = require("express");
require("dotenv").config();
const basicAuth = require('express-basic-auth');
const session = require('express-session');
const cors = require("cors");

const app = express();
const port = 3000;
const API_KEY = process.env.API_KEY;
const API_URL = process.env.API_URL || 'https://api.eduarhiv.com';

app.use(cors({
  origin: process.env.NODE_ENV === "production"
    ? ["https://eduarhiv.com", "https://www.eduarhiv.com"]
    : true,
  credentials: true,
}));

// Smart body parsing - REPLACE the old app.use(express.json()) lines with this:
// Better approach - handle upload separately, use normal parsing for everything else
app.use((req, res, next) => {
  if (req.path === '/upload') {
    return express.raw({ type: "*/*", limit: "50mb" })(req, res, next);
  }
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


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

// ... rest of your code stays the same

if (process.env.BASIC_AUTH_PASSWORD) {
  app.use(basicAuth({
    users: { 'demo': process.env.BASIC_AUTH_PASSWORD },
    challenge: true,
    realm: 'EduArhiv Demo'
  }));
}

app.use(express.static('public'));

require('./auth')(app, API_KEY);
require('./files')(app, API_KEY);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.get("/login", (req, res) => {
  res.sendFile(__dirname + "/public/login/login.html");
});

app.get("/dashboard", (req, res) => {
  if (req.session.isLoggedIn) {
    res.sendFile(__dirname + "/public/dashboard/dashboard.html");
  }
});

app.get("/file_view", (req, res) => {
  if (req.session.isLoggedIn) {
    res.sendFile(__dirname + "/public/file_view/file_view.html");
  }
});

app.get("/test_view", (req, res) => {
  if (req.session.isLoggedIn) {
    res.sendFile(__dirname + "/public/file_view/test_view.html");
  }
});


// STEP 6: Start server
app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on http://localhost:${port}`);
});