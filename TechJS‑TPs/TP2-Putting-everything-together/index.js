// index.js
import express from "express";
import mongoose from "mongoose";
import session from "express-session";
import passport from "passport";
import flash from "connect-flash";
import path from "path";
import bcrypt from "bcryptjs";
import { fileURLToPath } from "url";
import { Strategy as LocalStrategy } from "passport-local";

// === Setup ===
const app = express();
const PORT = process.env.PORT || 3000;

// For ES module path handling
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// === MongoDB Connection ===
mongoose
  .connect("mongodb://127.0.0.1:27017/tp2_auth", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// === User Model ===
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});

const User = mongoose.model("User", userSchema);

// === Passport Setup ===
passport.use(
  new LocalStrategy(async (username, password, done) => {
    const user = await User.findOne({ username });
    if (!user) return done(null, false, { message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return done(null, false, { message: "Wrong password" });
    return done(null, user);
  })
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

// === Middleware ===
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "secretkey",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// === Protect Middleware ===
const ensureAuth = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
};

// === Routes ===
app.get("/", (req, res) => res.redirect("/login"));

app.get("/register", (req, res) => res.render("register"));
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const existing = await User.findOne({ username });
  if (existing) return res.send("User already exists");
  const hashed = await bcrypt.hash(password, 10);
  await User.create({ username, password: hashed });
  res.redirect("/login");
});

app.get("/login", (req, res) => res.render("login", { message: req.flash("error") }));
app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/books",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

app.get("/books", ensureAuth, (req, res) => {
  const books = [
    { title: "The Pragmatic Programmer", author: "Andrew Hunt" },
    { title: "Clean Code", author: "Robert C. Martin" },
    { title: "You Don’t Know JS", author: "Kyle Simpson" },
  ];
  res.render("books", { user: req.user, books });
});

app.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/login");
  });
});

// === Server ===
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
