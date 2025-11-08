const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB (change URI si Atlas)
mongoose.connect("mongodb://127.0.0.1:27017/booktracker", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

// Schema & Model
const bookSchema = new mongoose.Schema({
  title: String,
  author: String,
  pages: Number,
  pagesRead: Number,
  price: Number,
  suggestedBy: String,
  status: String,
  format: String,
  finished: { type: Boolean, default: false }
});

const Book = mongoose.model("Book", bookSchema);

// Routes
app.get("/api/books", async (req, res) => {
  const books = await Book.find();
  res.json(books);
});

app.post("/api/books", async (req, res) => {
  const book = new Book(req.body);
  await book.save();
  res.json(book);
});

app.delete("/api/books/:id", async (req, res) => {
  await Book.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
