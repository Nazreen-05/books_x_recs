// Renders the Book Recs page from BOOKS (see books-data.js)
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("recs-container");
  if (!container) return;
 
  const categories = [...new Set(BOOKS.map(b => b.category))];
 
  categories.forEach(category => {
    const block = document.createElement("div");
    block.className = "category-block";
 
    const title = document.createElement("h2");
    title.className = "category-title";
    title.textContent = category;
    block.appendChild(title);
 
    const list = document.createElement("div");
    list.className = "book-list";
 
    BOOKS.filter(b => b.category === category).forEach(book => {
      list.appendChild(buildRecCard(book));
    });
 
    block.appendChild(list);
    container.appendChild(block);
  });
});
 
function buildRecCard(book) {
  const a = document.createElement("a");
  a.href = `book.html?slug=${book.slug}`;
  a.className = "book-card";
 
  const tropeLine = book.tropes && book.tropes.length
    ? `<p class="book-blurb trope-tag">${book.tropes.join(" · ")}</p>`
    : "";
 
  a.innerHTML = `
    <div class="book-cover-block">
      <img src="https://covers.openlibrary.org/b/isbn/${book.isbn}.jpg" alt="${book.title}">
      <p class="book-title">${book.title}</p>
    </div>
    <div class="book-info">
      <p class="rating">${book.rating}/5</p>
      <p class="book-blurb">Author: ${book.author}</p>
      ${tropeLine}
      <p class="book-blurb">${book.blurb}</p>
    </div>
  `;
  return a;
}
