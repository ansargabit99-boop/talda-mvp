# Talda — доказательная методика

Talda shows which chapter of which textbook, in which language edition, is failing students, and turns that into evidence-backed fixes. Built for the Zhambyl Hub hackathon case "Data-Driven Curriculum".

**What it does**
- **Misconception diagnostics.** Every wrong answer option is linked to a specific mistake, so the app shows *why* a topic fails, not just *that* it fails.
- **Fair textbook comparison.** Adjusts for city/village, small schools, language and past results, with 95% confidence intervals.
- **Language-gap detector.** Finds chapters where the Kazakh edition does much worse than the Russian one, which points to translation or terminology problems.
- **Root causes.** Shows which weak earlier topic drags down later ones.
- **Hours optimizer.** Redistributes the same 102 hours for the best expected result.
- **Findings tracker.** Evidence-backed findings with who should act on each, plus an AI-written memo (Gemini) in Russian or Kazakh.
- **Item bank.** Gemini tags new test questions: topic, which mistake each wrong option reveals, and a quality check.
- **Roles.** Methodologists see the whole region and manage schools; teachers upload and see only their own school.

## Run locally

```bash
python -m venv .venv
.venv/Scripts/python -m pip install -r requirements.txt   # macOS/Linux: .venv/bin/python
cp .env.example .env    # then put your GEMINI_API_KEY and ADMIN_PASSWORD in .env
.venv/Scripts/python -m uvicorn app.main:app --port 8000
```

Open http://localhost:8000. If you leave `ADMIN_PASSWORD` empty, a random password for the `metodist` account is written to `first_run_credentials.txt`. Locally the data lives in `talda.db` (SQLite).

For a demo: log in as the methodologist, go to **Загрузка результатов → Загрузить демо**. This loads 82 synthetic schools. The **Данные** tab then shows that the system found every pattern planted in the demo data.

## Deploy to Vercel

Vercel functions don't keep files between requests, so production uses Postgres.

1. In Vercel, **Add New → Project** and import this GitHub repository. No build settings are needed (`vercel.json` routes everything to `api/index.py`).
2. **Storage → Create Database → Neon (Postgres)** and connect it to the project. This sets `DATABASE_URL` automatically.
3. **Settings → Environment Variables:** add `ADMIN_PASSWORD` (methodologist password) and `GEMINI_API_KEY`. `GEMINI_MODEL` is optional; the default is `gemini-2.5-flash`.
4. Redeploy. The tables and the `metodist` account are created on first request.

## Upload formats

| Who | Format |
|---|---|
| Teacher (wide, easiest) | `student_id, T1.1, T1.2, … T12.3` — one row per student; cell = chosen letter A–D |
| Teacher (long) | `student_id, item_id, option` (+ optional `topic_hours`) |
| Methodologist (region) | `student_id, school_id, district, area, small, lang, textbook, prev_score, topic_id, topic_hours, item_id, option` |

For the base items T\*.1–T\*.3, letter A is the correct answer and B–D are the topic's mistakes 1–3. Items added to the bank (T9.4 and up) translate letters according to how they were tagged. CSV, `.xlsx` and `.csv.gz` are accepted.

## Structure

```
app/main.py           FastAPI: auth, schools, uploads, dataset, item bank, Gemini
app/static/engine.js  analytics: statistics, findings, views
app/static/app.js     login, uploads, item bank, AI memo, RU/KZ switch
api/index.py          Vercel entrypoint
```

## Limits (honest list for judges)
- The demo data is synthetic. Real school results are loaded through uploads.
- Root causes and hour effects are correlations; confirm them with a pilot in a few schools.
- The Kazakh UI covers navigation and the data-entry screens; the analytics text is still in Russian.
- The analytics run in the browser, which is fine up to a few hundred thousand answers.
