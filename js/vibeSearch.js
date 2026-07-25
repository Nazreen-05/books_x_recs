// js/vibe-search.js
// Powers the "describe your vibe" search box. Calls /api/vibe-search
// (a Vercel function that talks to Gemini) and always shows the
// visitor something sensible — a result, or a clear friendly message
// if search is rate-limited/down, instead of the box just doing nothing.

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("vibe-search-form");
  if (!form) return;

  const input = document.getElementById("vibe-search-input");
  const statusEl = document.getElementById("vibe-search-status");
  const resultsEl = document.getElementById("vibe-search-results");
  const submitBtn = form.querySelector("button[type='submit']");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const query = input.value.trim();
    if (!query) return;

    resultsEl.innerHTML = "";
    showStatus("Finding your next read...");
    submitBtn.disabled = true;

    // BOOKS comes from books-data.js, already loaded on the page.
    const trimmedBooks = BOOKS.map(b => ({
      slug: b.slug,
      title: b.title,
      author: b.author,
      category: b.category,
      tropes: b.tropes || [],
      blurb: b.blurb
    }));

    try {
      const response = await fetch("/api/vibeSearch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, books: trimmedBooks })
      });

      const data = await response.json().catch(() => null);

      if (!data) {
        showStatus("Couldn't reach smart search right now. Try browsing with the filters below instead.");
        return;
      }

      if (data.status === "rate_limited" || data.status === "error") {
        showStatus(data.message || "Smart search hit a snag. Try browsing with the filters below instead.");
        return;
      }

      if (!data.matches || data.matches.length === 0) {
        showStatus("Couldn't find a great match for that — try rephrasing, or browse using the filters below.");
        return;
      }

      hideStatus();
      data.matches.forEach(match => {
        const book = BOOKS.find(b => b.slug === match.slug);
        if (book) resultsEl.appendChild(buildVibeCard(book, match.reason));
      });

    } catch (err) {
      // Network failure, request blocked, etc.
      console.error("Vibe search request failed:", err);
      showStatus("Smart search is temporarily unavailable. Try browsing with the filters below instead.");
    } finally {
      submitBtn.disabled = false;
    }
  });

  function showStatus(message) {
    statusEl.textContent = message;
    statusEl.style.display = "block";
  }

  function hideStatus() {
    statusEl.style.display = "none";
  }
});

function buildVibeCard(book, reason) {
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
      ${reason ? `<p class="book-blurb" style="font-style:italic;color:#d99a4e;">${reason}</p>` : ""}
    </div>
  `;
  return a;
}