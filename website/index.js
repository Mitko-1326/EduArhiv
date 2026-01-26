const express = require("express");
require("dotenv").config();
const session = require('express-session');
const cors = require("cors");

const app = express();
const port = 3000;
const API_KEY = process.env.API_KEY;
const API_URL = process.env.API_URL || 'https://api.eduarhiv.com';

// 1. SERVE STATIC FILES (Images, CSS, JS)
app.use(express.static('public'));

// 2. SMART BODY PARSING (Crucial for uploads)
// This MUST come before app.use(express.json())
const binary_endpoints = ["/upload", "/replace"];
app.use((req, res, next) => {
  if (binary_endpoints.includes(req.path)) {
    return express.raw({ type: "*/*", limit: "50mb" })(req, res, next);
  }
  next();
});

// 3. STANDARD JSON PARSING
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. SESSION CONFIG
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

// 5. CORS
app.use(cors({
  origin: process.env.NODE_ENV === "production"
    ? ["https://eduarhiv.com", "https://www.eduarhiv.com"]
    : true,
  credentials: true,
}));

// 6. AUTH MIDDLEWARE
// FIXED: Added "/handle_login" to this list!
const publicPaths = ["/", "/login", "/handle_login"];
const htmlPagePaths = ["/", "/login", "/dashboard", "/file_view"];

app.use((req, res, next) => {
  // Normalize path (remove trailing slash)
  const cleanPath = req.path.replace(/\/$/, "") || "/";

  // Skip auth check for public paths (Login page AND Login action)
  if (publicPaths.includes(cleanPath)) {
    return next();
  }

  // Check if logged in
  if (req.session && req.session.isLoggedIn) {
    return next();
  }

  // HANDLE FAILURE
  if (htmlPagePaths.includes(cleanPath)) {
    return res.redirect("/login");
  } else {
    return res.status(401).json({ error: "Unauthorized" });
  }
});

// 7. ROUTES
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

// 8. START SERVER
app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on http://localhost:${port}`);
});