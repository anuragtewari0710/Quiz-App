// utils/helpers.js
// Reusable utility functions — adding auth/session helpers here later won't break other files

/**
 * Redirects the user to a given page
 * @param {string} page - e.g. "home.html" or "login.html"
 */
function redirectTo(page) {
  window.location.href = page;
}

/**
 * Gets a DOM element by ID (shorthand)
 * @param {string} id
 * @returns {HTMLElement}
 */
function getEl(id) {
  return document.getElementById(id);
}

/**
 * Adds a CSS class to an element
 * @param {HTMLElement} el
 * @param {string} className
 */
function addClass(el, className) {
  if (el) el.classList.add(className);
}

/**
 * Removes a CSS class from an element
 * @param {HTMLElement} el
 * @param {string} className
 */
function removeClass(el, className) {
  if (el) el.classList.remove(className);
}

/**
 * Sets the inner text of an element by ID
 * @param {string} id
 * @param {string} text
 */
function setText(id, text) {
  const el = getEl(id);
  if (el) el.innerText = text;
}

/**
 * Sets the inner HTML of an element by ID
 * @param {string} id
 * @param {string} html
 */
function setHTML(id, html) {
  const el = getEl(id);
  if (el) el.innerHTML = html;
}
