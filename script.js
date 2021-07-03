const calcContainer = document.querySelector('#calc-container');
const resultMode = document.querySelector('#result-mode');
const themeIcon = document.querySelector('#theme-icon');
const optionsIcon = document.querySelector('#options-icon');
const expressionInput = document.querySelector('#expression');
const expressionResult = document.querySelector('#expression-result');
const deleteIcon = document.querySelector('#delete-icon');

let currentMode;

function initializeInterface() {
  const userTheme = localStorage.getItem('userTheme');

  document.body.classList = userTheme;
  toggleImageSource(userTheme);

  calcContainer.style.opacity = 1;
}

function toggleTheme() {
  document.body.classList.toggle('dark-theme');

  const currentTheme = document.body.classList.value;
  toggleImageSource(currentTheme);

  localStorage.setItem('userTheme', currentTheme);
}

function toggleImageSource(theme) {
  const isDarkTheme = theme == 'dark-theme';

  themeIcon.src = isDarkTheme ? 'assets/sun.png' : 'assets/moon.png';
  optionsIcon.src = isDarkTheme ? 'assets/options-white.png' : 'assets/options.png';
  deleteIcon.src = isDarkTheme ? 'assets/delete-dark.png' : 'assets/delete.png';
}

function toggleResultMode() {
  currentMode = resultMode.textContent;
  resultMode.textContent = currentMode == 'RAD' ? 'GRAU' : 'RAD';
}

function clearExpressions() {
  expressionInput.value = '';
  expressionResult.textContent = '';
}

function deleteLastSymbol() {
  let expression = expressionInput.value;
  const lastLetter = expression[expression.length - 1];

  expression = expression.replace(lastLetter, '');
  expressionInput.value = expression;
}