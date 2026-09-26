# Cognitive Game Lab

A browser-based cognitive assessment practice simulator built with pure HTML, CSS, and JavaScript. It recreates four game formats inspired by publicly documented Aon-style mechanics: Grid Challenge (working memory), Logical Reasoning, Behavioral Module (personality-style assessment), and Motion Challenge (complex planning). No build tools, no dependencies — just open the file in a browser and start practicing.

Each challenge runs through four progressive passes that scale from medium to hard difficulty, with a visible timer, live score tracking, and instant feedback on every answer. The suite includes 20 distinct question types per game, randomized on every run so no two sessions feel identical. A strict scoring policy penalizes incorrect answers and unnecessary moves, while a small speed bonus rewards quick correct decisions.

Progress is saved locally in the browser using `localStorage`, so you can track completed runs and best scores per game without any backend or account. The interface is fully responsive, works on mobile and desktop, and includes a built-in guide explaining the practice format, scoring rules, and session structure.

This is an independent practice simulator — not an official Capgemini or Aon assessment. All questions and visuals are original, and employer configurations, timings, and scoring algorithms may differ. Use your actual invitation or tutorial as the authoritative source, and treat this as a training tool for building familiarity with the format.