// Renders a single book page based on ?slug= in the URL
// Replaces the need for a separate HTML file per book review.
// Comments are now stored in Firestore (shared, real, visible to everyone)
// instead of localStorage (which only lived in one browser).

import { db } from "/firebaseConfig.js";
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

let currentSlug = null;
let selectedRating = 0;
const commentsRef = collection(db, "comments");

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

// ── Comments storage ──
// Backed by Firestore now — comments are shared and visible to every
// visitor, not just stored in one browser.

function loadComments() {
  // Live-updating query: whenever anyone posts a comment for this
  // book, everyone currently viewing the page sees it appear instantly.
  const q = query(
    commentsRef,
    where("slug", "==", currentSlug),
    orderBy("timestamp", "desc")
  );

  onSnapshot(q, snapshot => {
    const list = document.getElementById("comments-list");
    list.innerHTML = "";
    snapshot.forEach(doc => {
      const c = doc.data();
      renderComment(c.name, c.text, c.rating);
    });
  }, error => {
    console.error("Couldn't load comments:", error);
  });
}

async function postComment() {
  const nameInput = document.getElementById("commenter-name");
  const textInput = document.getElementById("comment-text");

  const name = nameInput.value.trim();
  const text = textInput.value.trim();

  if (!name || !text) {
    alert("Please add your name and a comment before posting.");
    return;
  }

  try {
    await addDoc(commentsRef, {
      slug: currentSlug,
      name,
      text,
      rating: selectedRating,
      timestamp: serverTimestamp()
    });

    // No manual re-render needed — the onSnapshot listener above
    // will pick up the new comment automatically.
    nameInput.value = "";
    textInput.value = "";
    selectedRating = 0;
    highlightStars(0);
  } catch (err) {
    console.error("Couldn't post comment:", err);
    alert("Something went wrong posting your comment. Please try again.");
  }
}

// book.html calls postComment() via an inline onclick, so it needs
// to exist on window since this file is loaded as a module.
window.postComment = postComment;

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

