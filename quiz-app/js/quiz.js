// js/quiz.js — Full quiz logic with timer, sidebar palette, review marking

// ─── State ────────────────────────────────────────────────────────────────────
let currentSubject  = "";
let subjectQs       = [];          // All 50 questions for this subject
let currentIdx      = 0;           // Current question index (0-based)
let answers         = [];          // answers[i] = selected option index or null
let questionState   = [];          // "not-visited" | "seen" | "answered" | "review"
let timerInterval   = null;
let secondsLeft     = 30 * 60;     // 30 minutes

// ─── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", function () {
  // Read subject from sessionStorage (set by home.js)
  const saved = sessionStorage.getItem("selectedSubject");
  if (!saved || !questions[saved]) {
    redirectTo("home.html");
    return;
  }

  currentSubject = saved;
  subjectQs      = questions[currentSubject];          // All 50 questions
  answers        = new Array(subjectQs.length).fill(null);
  questionState  = new Array(subjectQs.length).fill("not-visited");

  // Mark first question as "seen"
  questionState[0] = "seen";

  setText("subject-badge", currentSubject);
  buildSidebarGrid();
  renderQuestion();
  startTimer();

  // Button listeners
  getEl("next-btn").addEventListener("click", handleNext);
  getEl("prev-btn").addEventListener("click", handlePrev);
  getEl("review-btn").addEventListener("click", handleMarkReview);
  getEl("submit-btn").addEventListener("click", openModal);
  getEl("leave-btn").addEventListener("click", function () {
    if (confirm("Leave the test? Your progress will be lost.")) {
      clearInterval(timerInterval);
      redirectTo("home.html");
    }
  });

  // Modal buttons
  getEl("modal-cancel").addEventListener("click", closeModal);
  getEl("modal-confirm").addEventListener("click", submitQuiz);

  // Close modal on overlay click
  getEl("modal-overlay").addEventListener("click", function (e) {
    if (e.target === getEl("modal-overlay")) closeModal();
  });
});

// ─── Timer ────────────────────────────────────────────────────────────────────
function startTimer() {
  updateTimerDisplay();
  timerInterval = setInterval(function () {
    secondsLeft--;
    updateTimerDisplay();
    if (secondsLeft <= 0) {
      clearInterval(timerInterval);
      submitQuiz();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const m = Math.floor(secondsLeft / 60);
  const s = secondsLeft % 60;
  const display = getEl("timer-display");
  display.textContent = String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
  removeClass(display, "warning");
  removeClass(display, "danger");
  if (secondsLeft <= 300) addClass(display, "danger");
  else if (secondsLeft <= 600) addClass(display, "warning");
}

// ─── Render current question ──────────────────────────────────────────────────
function renderQuestion() {
  const q = subjectQs[currentIdx];
  const total = subjectQs.length;

  // Progress bar
  const pct = (currentIdx / total) * 100;
  getEl("progress-fill").style.width = pct + "%";

  // Counter
  setText("question-counter", "Question " + (currentIdx + 1) + " of " + total);

  // Question text
  setText("question-text", q.question);

  // Options
  const labels = ["A", "B", "C", "D"];
  const container = getEl("options-container");
  container.innerHTML = "";

  q.options.forEach(function (text, idx) {
    const btn = document.createElement("button");
    btn.className = "option-btn" + (answers[currentIdx] === idx ? " selected" : "");
    btn.innerHTML =
      '<span class="option-label">' + labels[idx] + '</span>' +
      '<span>' + text + '</span>';
    btn.addEventListener("click", function () { selectOption(idx); });
    container.appendChild(btn);
  });

  // Review button state
  const reviewBtn = getEl("review-btn");
  if (questionState[currentIdx] === "review") {
    addClass(reviewBtn, "active");
    reviewBtn.textContent = "Unmark Review";
  } else {
    removeClass(reviewBtn, "active");
    reviewBtn.textContent = "Mark for Review";
  }

  // Prev button visibility
  getEl("prev-btn").style.visibility = currentIdx === 0 ? "hidden" : "visible";

  // Next button label
  getEl("next-btn").textContent =
    currentIdx === total - 1 ? "Save & Submit" : "Save & Next";

  // Clear warning
  setText("warning-msg", "");

  // Update sidebar highlight
  updateSidebar();
}

// ─── Option selection ─────────────────────────────────────────────────────────
function selectOption(idx) {
  answers[currentIdx] = idx;
  // If it was "seen" or "review", move to "answered" (keep "review" label if marked)
  if (questionState[currentIdx] !== "review") {
    questionState[currentIdx] = "answered";
  }

  // Refresh option visuals only
  const btns = document.querySelectorAll(".option-btn");
  btns.forEach(function (btn, i) {
    btn.classList.toggle("selected", i === idx);
  });

  updateSidebar();
}

// ─── Navigation ───────────────────────────────────────────────────────────────
function handleNext() {
  if (answers[currentIdx] === null && questionState[currentIdx] !== "review") {
    setText("warning-msg", "Please select an answer or mark for review before continuing.");
    return;
  }

  // Last question — open submit modal
  if (currentIdx === subjectQs.length - 1) {
    openModal();
    return;
  }

  currentIdx++;
  // Mark as seen if not already answered/review
  if (questionState[currentIdx] === "not-visited") {
    questionState[currentIdx] = "seen";
  }
  renderQuestion();
}

function handlePrev() {
  if (currentIdx === 0) return;
  currentIdx--;
  renderQuestion();
}

// ─── Mark for review ──────────────────────────────────────────────────────────
function handleMarkReview() {
  if (questionState[currentIdx] === "review") {
    // Unmark — go back to answered or seen
    questionState[currentIdx] = answers[currentIdx] !== null ? "answered" : "seen";
  } else {
    questionState[currentIdx] = "review";
  }
  renderQuestion();
}

// ─── Sidebar grid ─────────────────────────────────────────────────────────────
function buildSidebarGrid() {
  const grid = getEl("sidebar-grid");
  grid.innerHTML = "";
  subjectQs.forEach(function (_, i) {
    const sq = document.createElement("div");
    sq.className = "q-square";
    sq.id = "sq-" + i;
    sq.textContent = i + 1;
    sq.addEventListener("click", function () { jumpTo(i); });
    grid.appendChild(sq);
  });
}

function jumpTo(idx) {
  currentIdx = idx;
  if (questionState[currentIdx] === "not-visited") {
    questionState[currentIdx] = "seen";
  }
  renderQuestion();
}

function updateSidebar() {
  let answered = 0, seen = 0, review = 0;

  subjectQs.forEach(function (_, i) {
    const sq = getEl("sq-" + i);
    if (!sq) return;

    sq.className = "q-square";
    if (i === currentIdx) addClass(sq, "current");

    const st = questionState[i];
    if (st === "answered")    { addClass(sq, "answered");  answered++; }
    else if (st === "review") { addClass(sq, "review");    review++; }
    else if (st === "seen")   { addClass(sq, "seen");      seen++; }
  });

  const left = subjectQs.length - answered - review;
  setText("stat-answered", answered);
  setText("stat-seen", seen);
  setText("stat-review", review);
  setText("stat-left", Math.max(0, subjectQs.length - answered));
}

// ─── Submit modal ─────────────────────────────────────────────────────────────
function openModal() {
  const answered = questionState.filter(s => s === "answered").length;
  const unanswered = subjectQs.length - answered;
  const review = questionState.filter(s => s === "review").length;

  setText("modal-answered", answered);
  setText("modal-unanswered", unanswered);
  setText("modal-review", review);

  getEl("modal-overlay").classList.add("open");
}

function closeModal() {
  getEl("modal-overlay").classList.remove("open");
}

// ─── Final submission ─────────────────────────────────────────────────────────
function submitQuiz() {
  clearInterval(timerInterval);
  closeModal();

  // Calculate score
  let score = 0;
  subjectQs.forEach(function (q, i) {
    if (answers[i] === q.answer) score++;
  });

  const total = subjectQs.length;
  const pct = Math.round((score / total) * 100);

  let feedback = "";
  if (pct === 100)     feedback = "Perfect score. Excellent command of " + currentSubject + ".";
  else if (pct >= 80)  feedback = "Strong performance. You have a solid grasp of the subject.";
  else if (pct >= 60)  feedback = "Good attempt. Review the topics you missed to strengthen your understanding.";
  else if (pct >= 40)  feedback = "Fair attempt. Focused revision of core topics is recommended.";
  else                 feedback = "Keep practicing. Revisit the fundamentals and attempt again.";

  // Show result page
  getEl("quiz-layout").style.display = "none";
  const rp = getEl("result-page");
  rp.style.display = "flex";

  setText("result-subject-tag", currentSubject + " Quiz");
  setText("score-big", score + " / " + total);
  setText("score-sub", pct + "% score");
  setText("feedback-msg", feedback);

  // Result action buttons
  getEl("retry-btn").onclick = function () {
    sessionStorage.setItem("selectedSubject", currentSubject);
    window.location.reload();
  };

  getEl("change-subject-btn").onclick = function () {
    redirectTo("home.html");
  };

  getEl("home-btn").onclick = function () {
    redirectTo("home.html");
  };
}
