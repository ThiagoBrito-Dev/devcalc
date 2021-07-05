const calcContainer = document.querySelector('#calc-container');
const resultMode = document.querySelector('#result-mode');
const themeIcon = document.querySelector('#theme-icon');
const optionsIcon = document.querySelector('#options-icon');
const expressionInput = document.querySelector('#expression');
const expressionResult = document.querySelector('#result');
const deleteIcon = document.querySelector('#delete-icon');

let currentMode;
let expressionOperator;

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

function addNumbersOnDisplay(number) {
  expressionInput.value += number;
}

function addOperatorsOnDisplay(operator) {
  expressionOperator = operator;

  if (operator == '*') {
    operator = 'x';
  } else if (operator == '/') {
    operator = '÷';
  }

  expressionInput.value += operator;
}

function calculateResult() {
  const completeExpression = (expressionInput.value).replace('x', '*').replace('÷', '/');

  if (completeExpression.indexOf(expressionOperator) != -1) {
    let numbers = completeExpression.split(expressionOperator)

    if (numbers[0] != '' && numbers[1] != '') {
      numbers = [Number(numbers[0]), Number(numbers[1])];
      let result;

      switch (expressionOperator) {
        case '+': {
          result = numbers[0] + numbers[1];
          break
        }
        case '-': {
          result = numbers[0] - numbers[1];
          break
        }
        case '*': {
          result = numbers[0] * numbers[1];
          break
        }
        case '/': {
          result = numbers[0] / numbers[1];
          break
        }
      }

      display(result);
    }
  }
}

function display(result) {
  expressionInput.style.height = '48px';
  expressionInput.style.marginBottom = '20px';
  expressionResult.style.display = 'none';

  if (result) {
    expressionInput.style.height = '32px';
    expressionInput.style.marginBottom = '0';
    expressionResult.style.marginBottom = '20px';
    expressionResult.textContent = result;
    expressionResult.style.display = 'block';
  }
}

function clearExpressions() {
  expressionInput.value = '';
  expressionResult.textContent = '';

  display();
}

function deleteLastSymbol() {
  if (expressionInput.value) {
    let expression = expressionInput.value;
    let expressionArray = [];

    for (let letter in expression) {
      expressionArray.push(expression[letter]);
    }

    expressionArray.pop();
    expression = expressionArray.join('');
    expressionInput.value = expression;
  }
}