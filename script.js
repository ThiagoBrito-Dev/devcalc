const resultMode = document.querySelector('#result-mode');
const themeIcon = document.querySelector('#theme-icon');
const optionsIcon = document.querySelector('#options');

let currentMode;

function toggleTheme() {
  const currentTheme = document.body.classList.value;

  document.body.classList = currentTheme == '' ? 'dark-theme' : '';
  themeIcon.src = currentTheme == '' ? 'assets/sun.png' : 'assets/moon.png';
  optionsIcon.src = currentTheme == '' ? 'assets/options-white.png' : 'assets/options.png';
}

function toggleResultMode() {
  currentMode = resultMode.textContent;
  resultMode.textContent = currentMode == 'RAD' ? 'GRAU' : 'RAD';
}