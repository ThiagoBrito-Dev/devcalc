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
  expressionResult.style.display = "none";
}

function toggleTheme() {
  document.body.classList.toggle('dark-theme');

  const currentTheme = document.body.classList.value;
  toggleImageSource(currentTheme);

  localStorage.setItem('userTheme', currentTheme);

  expressionInput.style.transitionDuration = '0.25s';
  expressionResult.style.transitionDuration = '0.25s';
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
  const expression = expressionInput.value;
  const lastSymbol = Number(expression[expression.length - 1]);

  if (number != ',' || expressionInput.value.length >= 1 && !isNaN(lastSymbol)) {
    expressionInput.value += number;
  }
}

function addOperatorsOnDisplay(operator) {
  let expression = expressionInput.value;
  let expressionArray = [];

  for (let symbol in expression) {
    expressionArray.push(expression[symbol]);
  }

  const lastSymbol = expressionArray[expressionArray.length - 1];

  if (!expression) {
    if (operator == '-') {
      expressionInput.value += operator;
    }
  } else {
    if (expression.length > 1 || !isNaN(Number(lastSymbol))) {
      if (lastSymbol == '+' || lastSymbol == '-' || lastSymbol == 'x' || lastSymbol == '÷') {
        expressionArray.pop();

        if (lastSymbol == '-' && operator == '-') {
          operator = '+';
        } else if (lastSymbol == '-' && operator == '+') {
          operator = '-';
        }
      }

      expressionOperator = operator;

      expression = expressionArray.join('');
      expression += operator;
      expressionInput.value = expression.replace('*', 'x').replace('/', '÷');
    }
  }
}

function calculateResult() {
  const completeExpression = (expressionInput.value).replace('x', '*').replace('÷', '/');

  if (completeExpression.indexOf(expressionOperator) != -1) {
    let numbers = completeExpression.split(expressionOperator);
    numbers = [numbers[0].replace(',', '.'), numbers[1].replace(',', '.')];

    if (numbers[0] != '' && numbers[1] != '') {
      console.log('Passou por aqui 2');
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

      result = String(result).replace('.', ',');
      display(result);
    }
  }
}

function display(result) {
  expressionInput.style.height = '48px';
  expressionInput.style.transitionDuration = '0s';
  expressionInput.style.borderRadius = '2px';
  expressionInput.style.padding = '0px 8px 0 0';

  expressionResult.style.display = 'none';

  if (result) {
    expressionInput.style.height = '26.5px';
    expressionInput.style.borderRadius = '2px 2px 0 0';
    expressionInput.style.padding = '4px 8px 0 0';

    expressionResult.style.display = 'block';
    expressionResult.style.borderRadius = '0 0 2px 2px';

    expressionResult.textContent = result;
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

    for (let symbol in expression) {
      expressionArray.push(expression[symbol]);
    }

    expressionArray.pop();
    expression = expressionArray.join('');
    expressionInput.value = expression;
  }
}