// Renders the Book Recs page from BOOKS (see books-data.js)
// Includes filtering by category and by trope.

const filterState = {
  category: "All",
  tropes: new Set()
};

document.addEventListener("DOMContentLoaded", () => {
  renderFilterBar();
  renderResults();
});

// ── Filter bar ──

function renderFilterBar() {
  const bar = document.getElementById("filter-bar");
  if (!bar) return;

  const categories = [...new Set(BOOKS.map(b => b.category))];
  const tropes = [...new Set(BOOKS.flatMap(b => b.tropes || []))].sort();

  bar.innerHTML = "";

  // Category group (single-select)
  const categoryGroup = document.createElement("div");
  categoryGroup.className = "filter-group";
  categoryGroup.appendChild(makeLabel("Category:"));
  categoryGroup.appendChild(makeFilterButton("All", filterState.category === "All", () => {
    filterState.category = "All";
    renderFilterBar();
    renderResults();
  }));
  categories.forEach(cat => {
    categoryGroup.appendChild(makeFilterButton(cat, filterState.category === cat, () => {
      filterState.category = cat;
      renderFilterBar();
      renderResults();
    }));
  });
  bar.appendChild(categoryGroup);

  // Trope group (multi-select), only show if any tropes exist
  if (tropes.length) {
    const tropeGroup = document.createElement("div");
    tropeGroup.className = "filter-group";
    tropeGroup.appendChild(makeLabel("Tropes:"));
    tropes.forEach(trope => {
      const active = filterState.tropes.has(trope);
      tropeGroup.appendChild(makeFilterButton(trope, active, () => {
        if (filterState.tropes.has(trope)) {
          filterState.tropes.delete(trope);
        } else {
          filterState.tropes.add(trope);
        }
        renderFilterBar();
        renderResults();
      }));
    });
    bar.appendChild(tropeGroup);
  }

  // Clear filters, only show if something is active
  if (filterState.category !== "All" || filterState.tropes.size > 0) {
    const line = document.createElement("div");
    line.className = "filter-results-line";
    const clearBtn = document.createElement("button");
    clearBtn.className = "clear-filters-btn";
    clearBtn.textContent = "Clear filters";
    clearBtn.addEventListener("click", () => {
      filterState.category = "All";
      filterState.tropes.clear();
      renderFilterBar();
      renderResults();
    });
    line.appendChild(clearBtn);
    bar.appendChild(line);
  }
}

function makeLabel(text) {
  const span = document.createElement("span");
  span.className = "filter-group-label";
  span.textContent = text;
  return span;
}

function makeFilterButton(label, isActive, onClick) {
  const btn = document.createElement("button");
  btn.className = "filter-btn" + (isActive ? " active" : "");
  btn.textContent = label;
  btn.addEventListener("click", onClick);
  return btn;
}

// ── Results ──

function getFilteredBooks() {
  return BOOKS.filter(book => {
    const categoryMatch = filterState.category === "All" || book.category === filterState.category;
    const tropeMatch = filterState.tropes.size === 0 ||
      [...filterState.tropes].every(t => (book.tropes || []).includes(t));
    return categoryMatch && tropeMatch;
  });
}

function renderResults() {
  const container = document.getElementById("recs-container");
  container.innerHTML = "";

  const filtered = getFilteredBooks();
  const noFiltersActive = filterState.category === "All" && filterState.tropes.size === 0;

  if (noFiltersActive) {
    // Default view: grouped by category, like before
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
    return;
  }

  // Filtered view: flat list with a result count
  const countLine = document.createElement("p");
  countLine.className = "filter-results-line";
  countLine.style.marginBottom = "1.2rem";
  countLine.textContent = filtered.length === 0
    ? "No books match those filters."
    : `${filtered.length} book${filtered.length === 1 ? "" : "s"} found`;
  container.appendChild(countLine);

  if (filtered.length) {
    const list = document.createElement("div");
    list.className = "book-list";
    filtered.forEach(book => list.appendChild(buildRecCard(book)));
    container.appendChild(list);
  }
}

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