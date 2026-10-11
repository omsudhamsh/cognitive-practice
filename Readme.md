# Cognitive Game Lab

A browser-based cognitive assessment practice simulator built with pure HTML, CSS, and JavaScript. It recreates four game formats inspired by publicly documented Aon-style mechanics: Grid Challenge (working memory), Logical Reasoning, Behavioral Module (personality-style assessment), and Motion Challenge (complex planning). No build tools, no dependencies â€” just open the file in a browser and start practicing.

Each challenge runs through four progressive passes that scale from medium to hard difficulty, with a visible timer, live score tracking, and instant feedback on every answer. The suite includes 20 distinct question types per game, randomized on every run so no two sessions feel identical. A strict scoring policy penalizes incorrect answers and unnecessary moves, while a small speed bonus rewards quick correct decisions.

Progress is saved locally in the browser using `localStorage`, so you can track completed runs and best scores per game without any backend or account. The interface is fully responsive, works on mobile and desktop, and includes a built-in guide explaining the practice format, scoring rules, and session structure.

This is an independent practice simulator — not an official Capgemini or Aon assessment. All questions and visuals are original, and employer configurations, timings, and scoring algorithms may differ. Use your actual invitation or tutorial as the authoritative source, and treat this as a training tool for building familiarity with the format.
## AI Literacy + Core CS Mock Tests

Two 40-question technical screening mocks are available. They use the **same blueprint but different question sets**, so they work as two separate attempts rather than repeats.

| Route | Build | Notes |
|---|---|---|
| **`/mock-1`** | Full | Longer multi-line AI scenarios, per-question navigator, theme-level analysis bars |
| **`/mock-2`** | Compact | Single-file, terser prompts, lighter UI for slower devices |

`/AILITRACY-CORECS-MCQS` permanently redirects to `/mock-1`, so older links keep working.

Both share this structure:

- **Section A - AI Literacy (20 questions):** applied scenarios covering model foundations, prompt engineering, RAG and chunking, agentic systems, and responsible AI.
- **Section B - Core CS (20 questions):** Java and pseudocode tracing, complexity analysis, DSA, OOP, SQL and DBMS, REST/HTTP semantics, Git, networking, security, and DevOps.

The tests run entirely client-side. Correct answers and explanations stay hidden until the candidate submits, at which point they produce a scored breakdown by section, plus revision priorities derived from the questions actually missed.

## Core CS Concepts Mock Test

A dedicated **`/mock-3`** route holds a 40-question paper that is **core computer science only**. It contains no AI-literacy questions at all, so it can be used to isolate CS fundamentals from the combined mocks above.

| Topic | Questions | Coverage |
|---|---|---|
| **1 - Programming Logic & Problem Solving** | Q01-Q10 | Variables, data types, I/O logic, pseudocode tracing, output prediction |
| **2 - Data Structures & Algorithms** | Q11-Q20 | Arrays, strings, hashing, searching, sorting, time/space complexity |
| **3 - Software Engineering Fundamentals** | Q21-Q30 | OOP, DBMS, SQL, REST APIs, HTTP methods, Git basics |
| **4 - Modern Engineering Awareness** | Q31-Q40 | Client-server, cloud, API keys vs tokens, networking, cybersecurity, Agile, DevOps, Docker |

Each topic is worth 10 questions and gets its own tab, per-topic score card and theme-level analysis. The page keeps the same scoring rules as the other mocks: unanswered questions count as incorrect, answers are changeable until submission, and explanations are revealed only afterwards.

## Visitor counter

`POST /api/visitor` counts unique visitors. Uniqueness is based on the client IP address, which is **salted and SHA-256 hashed before storage** - raw IP addresses are never written to the store.

Because serverless memory is ephemeral (per-instance, reset on cold start, divergent across concurrent instances), a durable count requires an external store. Set either variable pair in the Vercel project settings:

| Vercel KV | Upstash Redis |
|---|---|
| `KV_REST_API_URL` | `UPSTASH_REDIS_REST_URL` |
| `KV_REST_API_TOKEN` | `UPSTASH_REDIS_REST_TOKEN` |

Optionally set `VISITOR_SALT` to rotate the hashing salt.

Without these variables the endpoint falls back to an in-memory set. It still works and still deduplicates within a warm instance, but counts reset on cold start - the UI labels this state as "not yet persistent" rather than presenting a durable figure.
