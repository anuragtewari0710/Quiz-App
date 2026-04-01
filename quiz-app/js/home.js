// js/home.js

document.addEventListener("DOMContentLoaded", function () {

  // Profile dropdown toggle
  const profileBtn = getEl("profile-btn");
  const profileDropdown = getEl("profile-dropdown");

  profileBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    profileDropdown.classList.toggle("open");
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", function () {
    profileDropdown.classList.remove("open");
  });

  // Profile page — future
  getEl("profile-page-btn").addEventListener("click", function () {
    alert("Profile page coming soon.");
  });

  // Logout
  getEl("logout-btn").addEventListener("click", function () {
    redirectTo("login.html");
  });

});

// Called by subject card onclick
function goToQuiz(subject) {
  // Pass subject via sessionStorage so quiz.js knows which one to load
  sessionStorage.setItem("selectedSubject", subject);
  redirectTo("quiz.html");
}
