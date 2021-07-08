const calcContainer = document.querySelector('#calc-container');
const resultMode = document.querySelector('#result-mode');
const themeIcon = document.querySelector('#theme-icon');
const optionsIcon = document.querySelector('#options-icon');
const expressionInput = document.querySelector('#expression');
const expressionResult = document.querySelector('#result');
const deleteIcon = document.querySelector('#delete-icon');

let currentMode;
let expressionOperator;
let lastNumber;
let isSameExpression = false;
let isDeleting = false;

let expression = '9.5+3+5-8*7/2';
let expressionArray = [];

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

  if (number != ',' || expression.length >= 1 && !isNaN(lastSymbol)) {
    expressionInput.value += number;

    if (isNaN(Number(expressionInput.value))) {
      triggerCalculation();
    }
  }
}

function triggerCalculation() {
  const expression = (expressionInput.value).replace('x', '*').replace('÷', '/')

  if (expressionResult.textContent) {
    const splittedExpression = expression.split(expressionOperator);

    lastNumber = splittedExpression[splittedExpression.length - 1];
    lastNumber = lastNumber.replace(',', '.');

    if (lastNumber.includes('.')) {
      isSameExpression = true;
    }

    calculateResult();
  } else {
    calculateResult();
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
      if (isNaN(Number(lastSymbol))) {
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
  const firstSymbol = completeExpression[0];

  if (completeExpression.indexOf(expressionOperator) != -1) {
    let shortExpression = completeExpression;
    let result = '';

    if (expressionResult.textContent) {
      let firstNumber = (expressionResult.textContent).replace(',', '.');

      if (isSameExpression || lastNumber.length > 1) {
        const diferenceBetweenExpressionNumbers = Number(lastNumber
          .slice(0, -1)
          .replace(',', '.'));
        firstNumber = Number(firstNumber);

        switch (expressionOperator) {
          case '+':
            firstNumber = firstNumber - diferenceBetweenExpressionNumbers;
            break;
          case '-':
            firstNumber = firstNumber + diferenceBetweenExpressionNumbers;
            break;
          case '*':
            firstNumber = firstNumber / diferenceBetweenExpressionNumbers;
            break;
          case '/':
            firstNumber = firstNumber * diferenceBetweenExpressionNumbers;
        }
      } else if (isDeleting && lastNumber == '') {
        display(result);
      }

      isSameExpression = false;
      shortExpression = firstNumber + expressionOperator + lastNumber;
    }

    let numbers = shortExpression.split(expressionOperator);
    console.log(numbers);

    if (isNaN(firstSymbol)) {
      shortExpression = completeExpression.slice(1);
      numbers = shortExpression.split(expressionOperator);
      numbers[0] = firstSymbol + numbers[0];
    }

    numbers = [numbers[0].replace(',', '.'), numbers[1].replace(',', '.')];

    if (numbers[0] != '' && numbers[1] != '') {
      numbers = [Number(numbers[0]), Number(numbers[1])];

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

    isDeleting = true;
    triggerCalculation();
    isDeleting = false;
  }
}