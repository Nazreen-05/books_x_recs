// /api/vibe-search.js
// Vercel serverless function. Keeps the Gemini API key server-side
// (never exposed to the browser) and matches a visitor's described
// "vibe" against the book list, using Gemini's free tier.
//
// Designed to degrade gracefully: if the API key is missing, if
// Gemini is rate-limited, or if anything else goes wrong, this
// always returns a normal JSON response with a clear status and a
// friendly message — it never just fails silently or crashes the page.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      status: "error",
      message: "Something went wrong. Try browsing with the filters below instead."
    });
  }

  const { query, books } = req.body || {};

  if (!query || typeof query !== "string" || !query.trim()) {
    return res.status(400).json({
      status: "error",
      message: "Tell me a bit about what you're in the mood for."
    });
  }

  if (!Array.isArray(books) || books.length === 0) {
    return res.status(400).json({
      status: "error",
      message: "No books to search yet. Try browsing with the filters below instead."
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error("GEMINI_API_KEY is not set");
    return res.status(200).json({
      status: "error",
      message: "Smart search isn't set up yet. Try browsing with the filters below instead."
    });
  }

  const prompt = `You are a book recommendation matcher for a personal book review blog.
A visitor described what kind of book they want. Based ONLY on the books listed below
(do not invent books that aren't in the list), pick the best 1-3 matches and give a short,
one-sentence reason each fits what they asked for.

Respond with ONLY valid JSON, no markdown formatting, no extra text, in exactly this shape:
{"matches":[{"slug":"book-slug","reason":"short reason"}]}

If nothing in the list is a reasonable fit, respond with:
{"matches":[]}

Visitor's request: "${query.trim()}"

Books (JSON list): ${JSON.stringify(books)}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        }),
        signal: controller.signal
      }
    );

    clearTimeout(timeout);

    if (geminiResponse.status === 429) {
      // Free tier quota hit — this is the "site went viral" case.
      return res.status(200).json({
        status: "rate_limited",
        message: "Smart search is getting a lot of love right now and hit its limit. Try again in a minute, or browse using the filters below."
      });
    }

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text().catch(() => "");
      console.error("Gemini API error:", geminiResponse.status, errorText);
      return res.status(200).json({
        status: "error",
        message: "Smart search is having a moment. Try browsing with the filters below instead."
      });
    }

    const data = await geminiResponse.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    let parsed;
    try {
      const cleaned = rawText.replace(/```json|```/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error("Failed to parse Gemini response:", rawText);
      return res.status(200).json({
        status: "error",
        message: "Couldn't quite make sense of that search. Try rephrasing, or browse using the filters below."
      });
    }

    return res.status(200).json({
      status: "ok",
      matches: Array.isArray(parsed.matches) ? parsed.matches : []
    });

  } catch (err) {
    // Covers network failures, timeouts, and anything unexpected.
    console.error("vibe-search failed:", err);
    return res.status(200).json({
      status: "error",
      message: "Smart search is temporarily unavailable. Try browsing with the filters below instead."
    });
  }
}