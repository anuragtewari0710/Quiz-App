// js/login.js

document.addEventListener("DOMContentLoaded", function () {
  const loginBtn = getEl("login-btn");

  loginBtn.addEventListener("click", function () {
    // Future: validate and authenticate here
    redirectTo("home.html");
  });

  // Allow Enter key on any field to proceed
  document.querySelectorAll(".input-field").forEach(function (input) {
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") redirectTo("home.html");
    });
  });
});
