const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  title: String,
  author: String,
  pages: Number,
  pagesRead: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ["Read", "Re-read", "DNF", "Currently reading", "Returned Unread", "Want to read"],
    default: "Want to read"
  },
  format: {
    type: String,
    enum: ["Print", "PDF", "Ebook", "AudioBook"],
    default: "Print"
  },
  price: Number,
  suggestedBy: String,
  finished: { type: Boolean, default: false }
});

// Class methods
bookSchema.methods.currentlyAt = function() {
  return `${((this.pagesRead / this.pages) * 100).toFixed(2)}%`;
};

bookSchema.methods.deleteBook = async function() {
  return await this.deleteOne();
};

// Middleware: automatically mark finished
bookSchema.pre("save", function(next) {
  if (this.pagesRead >= this.pages) this.finished = true;
  next();
});

module.exports = mongoose.model("Book", bookSchema);
