/* =====================================================
   DOM ELEMENT REFERENCES
   ===================================================== */

const getColorSchemeBtn = document.getElementById("get-color-scheme-btn");
const seedColorInput = document.getElementById("seed-color");
const modeSelector = document.querySelector(".mode-selector");
const colorCardsList = document.querySelector(".color-cards-list");
const loader = document.getElementById("loader");
const themeToggleBtn = document.getElementById("theme-toggle-btn");

/* =====================================================
   INITIAL SETUP (Theme restore)
   ===================================================== */

// Restore saved theme on page load
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
  document.documentElement.setAttribute("data-theme", "dark");
  themeToggleBtn.textContent = "☀️";
}

/* =====================================================
   STATE
   ===================================================== */

// Holds color data returned from API
let colors = [];

/* =====================================================
   EVENT LISTENERS
   ===================================================== */

/**
 * Global click handler (event delegation)
 * - Handles button clicks
 * - Handles color-card copy action
 */
document.addEventListener("click", handleGlobalClick);

/* =====================================================
   EVENT HANDLERS
   ===================================================== */

function handleGlobalClick(event) {
  const target = event.target;

  // Generate color scheme
  if (target.id === "get-color-scheme-btn") {
    handleGetColorScheme();
    return;
  }

  // Toggle theme
  if (target.id === "theme-toggle-btn") {
    toggleTheme();
    return;
  }

  // Copy HEX on color-card click
  const card = target.closest(".color-card");
  if (!card) return;

  const hex = card.dataset.hex;
  copyToClipboard(hex);
  showToastOnCard(card, hex);
}

/**
 * Handle "Get color scheme" button click
 */
function handleGetColorScheme() {
  const seedHex = seedColorInput.value.slice(1); // remove #
  const mode = modeSelector.value;

  getColorSchemeBtn.disabled = true;
  fetchColorScheme(seedHex, mode, 5);
}

/**
 * Toggle dark / light theme and persist preference
 */
function toggleTheme() {
  const isDark = document.documentElement.hasAttribute("data-theme");

  if (isDark) {
    document.documentElement.removeAttribute("data-theme");
    localStorage.setItem("theme", "light");
    themeToggleBtn.textContent = "🌙";
  } else {
    document.documentElement.setAttribute("data-theme", "dark");
    localStorage.setItem("theme", "dark");
    themeToggleBtn.textContent = "☀️";
  }
}

/* =====================================================
   API LOGIC
   ===================================================== */

/**
 * Fetch color scheme from The Color API
 * @param {string} seedHex - Base color (without #)
 * @param {string} mode - Scheme mode
 * @param {number} count - Number of colors
 */
function fetchColorScheme(seedHex, mode, count = 5) {
  const url = `https://www.thecolorapi.com/scheme?hex=${seedHex}&mode=${mode}&count=${count}`;

  showLoader();

  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      colors = data.colors;
      renderColorCards();
    })
    .catch((error) => {
      console.error("Failed to fetch color scheme:", error);
    })
    .finally(() => {
      hideLoader();
      getColorSchemeBtn.disabled = false;
    });
}

/* =====================================================
   UI RENDERING
   ===================================================== */

/**
 * Render color cards into the DOM
 */
function renderColorCards() {
  const markup = colors
    .map((color) => {
      return `
        <div class="color-card" data-hex="${color.hex.value}">
          <div
            class="color-preview"
            style="background-color: ${color.hex.value}"
          ></div>
          <p class="color-code">${color.hex.value}</p>
        </div>
      `;
    })
    .join("");

  colorCardsList.innerHTML = markup;
}

/* =====================================================
   LOADER CONTROLS
   ===================================================== */

function showLoader() {
  loader.classList.remove("hidden");
  colorCardsList.classList.add("hidden");
}

function hideLoader() {
  loader.classList.add("hidden");
  colorCardsList.classList.remove("hidden");
}

/* =====================================================
   CLIPBOARD + TOAST
   ===================================================== */

/**
 * Copy text to clipboard using Clipboard API
 */
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).catch((error) => {
    console.error("Clipboard copy failed:", error);
  });
}

/**
 * Show contextual toast above clicked color card
 */
function showToastOnCard(card, hex) {
  // Remove existing toast (if user clicks fast)
  const existingToast = card.querySelector(".copy-toast");
  if (existingToast) existingToast.remove();

  const toast = document.createElement("div");
  toast.className = "copy-toast";
  toast.textContent = `${hex} copied`;

  card.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 1200);
}

