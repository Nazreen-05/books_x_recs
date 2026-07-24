// Renders a single book page based on ?slug= in the URL
// Replaces the need for a separate HTML file per book review.
 
let currentSlug = null;
let selectedRating = 0;
 
document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");
  const book = BOOKS.find(b => b.slug === slug);
 
  if (!book) {
    document.querySelector(".book-page").innerHTML =
      "<p style='color:#fff'>Book not found. <a href='bookRecs.html' style='color:#d99a4e'>Back to Book Recs</a></p>";
    return;
  }
 
  currentSlug = book.slug;
 
  document.title = `Books x Recs - ${book.title}`;
  document.getElementById("book-cover").src = `https://covers.openlibrary.org/b/isbn/${book.isbn}.jpg`;
  document.getElementById("book-cover").alt = book.title;
  document.getElementById("book-title").textContent = book.title;
  document.getElementById("book-author").textContent = book.author;
  document.getElementById("book-rating").textContent = `${book.rating}/5`;
 
  const ageNoteEl = document.getElementById("book-age-note");
  if (book.ageNote) {
    ageNoteEl.textContent = book.ageNote;
  } else {
    ageNoteEl.style.display = "none";
  }
 
  const tropesEl = document.getElementById("book-tropes");
  if (book.tropes && book.tropes.length) {
    tropesEl.textContent = book.tropes.join(" · ");
  } else {
    tropesEl.style.display = "none";
  }
 
  const reviewEl = document.getElementById("book-review-text");
  reviewEl.innerHTML = book.review.map(p => `<p>${p}</p>`).join("");
 
  const verdictEl = document.getElementById("book-verdict");
  if (book.verdict) {
    verdictEl.innerHTML = `<p class="review-verdict">Verdict: ${book.verdict}</p>`;
  }
 
  setupStarRating();
  loadComments();
});
 
function setupStarRating() {
  const stars = document.querySelectorAll(".star");
  stars.forEach(star => {
    star.addEventListener("mouseover", () => highlightStars(star.dataset.value));
    star.addEventListener("mouseout", () => highlightStars(selectedRating));
    star.addEventListener("click", () => {
      selectedRating = parseInt(star.dataset.value);
      highlightStars(selectedRating);
    });
  });
}
 
function highlightStars(count) {
  document.querySelectorAll(".star").forEach(s => {
    s.classList.toggle("active", parseInt(s.dataset.value) <= count);
  });
}
 
//Comments
 
function commentsKey() {
  return `comments-${currentSlug}`;
}
 
function loadComments() {
  const saved = JSON.parse(localStorage.getItem(commentsKey()) || "[]");
  const list = document.getElementById("comments-list");
  list.innerHTML = "";
  saved.forEach(c => renderComment(c.name, c.text, c.rating));
}
 
function postComment() {
  const nameInput = document.getElementById("commenter-name");
  const textInput = document.getElementById("comment-text");
 
  const name = nameInput.value.trim();
  const text = textInput.value.trim();
 
  if (!name || !text) {
    alert("Please add your name and a comment before posting.");
    return;
  }
 
  const saved = JSON.parse(localStorage.getItem(commentsKey()) || "[]");
  saved.push({ name, text, rating: selectedRating });
  localStorage.setItem(commentsKey(), JSON.stringify(saved));
 
  renderComment(name, text, selectedRating);
 
  nameInput.value = "";
  textInput.value = "";
  selectedRating = 0;
  highlightStars(0);
}
 
function renderComment(name, text, rating) {
  const list = document.getElementById("comments-list");
  const card = document.createElement("div");
  card.className = "comment-card";
  const starLine = rating ? `<p class="comment-stars">${"★".repeat(rating)}${"☆".repeat(5 - rating)}</p>` : "";
  card.innerHTML = `
    <p class="comment-author">${escapeHtml(name)}</p>
    ${starLine}
    <p class="comment-body">${escapeHtml(text)}</p>
  `;
  list.prepend(card);
}
 
function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
