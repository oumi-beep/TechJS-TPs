const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const flash = require("connect-flash");
const path = require("path");

const app = express();

mongoose
  .connect("mongodb://127.0.0.1:27017/tp2_auth", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("DB error:", err));

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(session({ secret: "secret123", resave: false, saveUninitialized: false }));
app.use(flash());

require("./config/passportConfig")(passport);
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.user = req.user;
  next();
});

app.get("/", (req, res) => res.redirect("/login"));

app.get("/register", (req, res) => res.render("register"));
app.get("/login", (req, res) => res.render("login"));

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  req.flash("error", "Please login to access this page");
  res.redirect("/login");
}

let books = [
  { title: "The Lean Startup", author: "Eric Ries" },
  { title: "The Pragmatic Programmer", author: "Andrew Hunt & David Thomas" },
  { title: "Atomic Habits", author: "James Clear" },
  { title: "Deep Work", author: "Cal Newport" },
  { title: "Clean Code", author: "Robert C. Martin" },
  { title: "Thinking, Fast and Slow", author: "Daniel Kahneman" },
];


app.get("/books", ensureAuthenticated, (req, res) => {
  res.render("books", { books });
});

const User = require("./models/User");
const bcrypt = require("bcryptjs");

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  let user = await User.findOne({ username });
  if (user) {
    req.flash("error", "User already exists");
    return res.redirect("/register");
  }
  const hashed = await bcrypt.hash(password, 10);
  user = new User({ username, password: hashed });
  await user.save();
  req.flash("success", "Registration successful, please log in");
  res.redirect("/login");
});


app.post("/login", passport.authenticate("local", {
  successRedirect: "/books",
  failureRedirect: "/login",
  failureFlash: true,
}));


app.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash("success", "Logged out successfully");
    res.redirect("/login");
  });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
