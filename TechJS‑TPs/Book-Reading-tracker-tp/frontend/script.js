const API_URL = "http://localhost:5000/api/books";
const form = document.getElementById("bookForm");
const bookList = document.getElementById("bookList");
const summary = document.getElementById("summary");

async function loadBooks() {
  try {
    const res = await fetch(API_URL);
    const books = await res.json();

    if (!Array.isArray(books)) throw new Error("Invalid response");

    bookList.innerHTML = books.map((b) => {
      const percent = ((b.pagesRead / b.pages) * 100).toFixed(1);
      const barColor = b.finished ? "bg-green-500" : "bg-blue-500";

      return `
        <div class="bg-white p-4 rounded-xl shadow flex justify-between items-center">
          <div>
            <h2 class="font-bold text-lg text-indigo-700">${b.title}</h2>
            <p class="text-gray-600">${b.author} • ${b.format}</p>
            <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div class="${barColor} h-2 rounded-full" style="width: ${percent}%;"></div>
            </div>
            <p class="text-sm mt-1">${percent}% read (${b.pagesRead}/${b.pages} pages)</p>
          </div>
          <button onclick="deleteBook('${b._id}')" class="text-red-500 hover:text-red-700">🗑</button>
        </div>
      `;
    }).join("");

    const totalBooks = books.length;
    const finishedBooks = books.filter(b => b.finished).length;
    const totalPages = books.reduce((a, b) => a + b.pages, 0);
    const totalRead = books.reduce((a, b) => a + b.pagesRead, 0);

    summary.innerHTML = `
      <h3 class="text-xl font-semibold text-indigo-700">Global Progress</h3>
      <p>Total books: <b>${totalBooks}</b></p>
      <p>Books finished: <b>${finishedBooks}</b></p>
      <p>Total pages read: <b>${totalRead}/${totalPages}</b></p>
    `;
  } catch (error) {
    console.error("Error loading books:", error);
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const book = {
    title: title.value,
    author: author.value,
    pages: Number(pages.value),
    pagesRead: Number(pagesRead.value || 0),
    price: Number(price.value || 0),
    suggestedBy: suggestedBy.value,
    status: status.value,
    format: format.value,
  };

  await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(book),
  });

  form.reset();
  loadBooks();
});

async function deleteBook(id) {
  await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  loadBooks();
}

loadBooks();
