# Data Science Classroom Quiz

    npm install
    npm run dev        # http://localhost:5173
    npm run validate   # checks the 50 questions / answer key

Data lives in `src/data/questions.js` (questions from the PDF + the instructor's `answerKey`).
Scoring uses only `answerKey`; each option keeps its original letter, so shuffling can't break it.
