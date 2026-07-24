// Renders the homepage book rows from BOOKS (see books-data.js)
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("book-rows");
  if (!container) return;
 
  const categories = [...new Set(BOOKS.map(b => b.category))];
 
  categories.forEach(category => {
    const heading = document.createElement("h3");
    heading.textContent = category;
    container.appendChild(heading);
 
    const list = document.createElement("div");
    list.className = "book-list";
 
    BOOKS.filter(b => b.category === category).forEach(book => {
      list.appendChild(buildHomeCard(book));
    });
 
    container.appendChild(list);
  });
});
 
function buildHomeCard(book) {
  const a = document.createElement("a");
  a.href = `book.html?slug=${book.slug}`;
  a.className = "book-card";
  a.innerHTML = `
    <div class="book-cover-block">
      <img src="https://covers.openlibrary.org/b/isbn/${book.isbn}.jpg" alt="${book.title}">
      <p class="book-title">${book.title}</p>
    </div>
    <div class="book-info">
      <p class="rating">${book.rating}/5</p>
      <p class="book-blurb">Author: ${book.author}</p>
      <p class="book-blurb">${book.blurb}</p>
    </div>
  `;
  return a;
}
