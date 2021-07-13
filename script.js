const calcContainer = document.querySelector("#calc-container");
const resultMode = document.querySelector("#result-mode");
const themeIcon = document.querySelector("#theme-icon");
const optionsIcon = document.querySelector("#options-icon");
const expressionInput = document.querySelector("#expression");
const expressionResult = document.querySelector("#result");
const deleteIcon = document.querySelector("#delete-icon");

let currentMode;
let expressionOperator;
let lastNumber;
let isSameExpression = false;
let isDeleting = false;
let lastDigit;
let isLastExpression = false;
let currentExpressionNumber = "";
let firstPosition;

function initializeInterface() {
  const userTheme = localStorage.getItem("userTheme");

  document.body.classList = userTheme;
  toggleImageSource(userTheme);

  calcContainer.style.opacity = 1;
  expressionResult.style.display = "none";
}

function toggleTheme() {
  document.body.classList.toggle("dark-theme");

  const currentTheme = document.body.classList.value;
  toggleImageSource(currentTheme);

  localStorage.setItem("userTheme", currentTheme);

  expressionInput.style.transitionDuration = "0.25s";
  expressionResult.style.transitionDuration = "0.25s";
}

function toggleImageSource(theme) {
  const isDarkTheme = theme == "dark-theme";

  themeIcon.src = isDarkTheme ? "assets/sun.png" : "assets/moon.png";
  optionsIcon.src = isDarkTheme
    ? "assets/options-white.png"
    : "assets/options.png";
  deleteIcon.src = isDarkTheme ? "assets/delete-dark.png" : "assets/delete.png";
}

function toggleResultMode() {
  currentMode = resultMode.textContent;
  resultMode.textContent = currentMode == "RAD" ? "GRAU" : "RAD";
}

function addNumbersOnDisplay(number) {
  const expression = expressionInput.value;
  const lastSymbol = Number(expression[expression.length - 1]);

  if (number != "," || (expression.length >= 1 && !isNaN(lastSymbol))) {
    expressionInput.value += number;

    if (isNaN(Number(expressionInput.value))) {
      triggerCalculation(number);
    }
  }

  checkAndChangeFontSize();
  formatExpressionNumbers(number);
}

function addOperatorsOnDisplay(operator) {
  let expression = expressionInput.value;
  let expressionArray = [];

  for (let symbol in expression) {
    expressionArray.push(expression[symbol]);
  }

  const lastSymbol = expressionArray[expressionArray.length - 1];

  if (!expression) {
    if (operator == "-") {
      expressionInput.value += operator;
    }
  } else {
    if (expression.length > 1 || !isNaN(Number(lastSymbol))) {
      if (isNaN(Number(lastSymbol))) {
        expressionArray.pop();

        if (lastSymbol == "-" && operator == "-") {
          operator = "+";
        } else if (lastSymbol == "-" && operator == "+") {
          operator = "-";
        }
      }

      expressionOperator = operator;

      expression = expressionArray.join("");
      expression += operator;
      expressionInput.value = expression.replace("*", "x").replace("/", "÷");
    }
  }

  currentExpressionNumber = "";
  checkAndChangeFontSize();
}

function focalizeResult() {
  setElementsToDefaultStyling();

  expressionInput.value = expressionResult.textContent;
}

function checkAndChangeFontSize() {
  const expression = expressionInput.value;

  if (expression.length >= 18 && expressionInput.style.fontSize != "16.5px") {
    expressionInput.style.fontSize = "16.5px";
  } else if (expressionInput.style.fontSize == "16.5px") {
    expressionInput.style.fontSize = "20px";
  }
}

function formatExpressionNumbers(number = "") {
  let expression = expressionInput.value;
  const expressionArray = [];

  if (currentExpressionNumber == "") {
    firstPosition = expression.indexOf(number, expression.length - 1);
  }

  for (let symbol in expression) {
    expressionArray.push(expression[symbol]);
  }

  currentExpressionNumber += number;

  if (!expression.includes(",") && currentExpressionNumber) {
    const formattedExpressionNumber = Number(
      currentExpressionNumber
    ).toLocaleString("pt-BR");

    expressionArray.splice(
      firstPosition,
      formattedExpressionNumber.length + 1,
      formattedExpressionNumber
    );
  }

  expression = expressionArray.join("");
  expressionInput.value = expression;
}

function triggerCalculation() {
  const expression = expressionInput.value.replace("x", "*").replace("÷", "/");
  const splittedExpression = expression.split(expressionOperator);

  if (splittedExpression.length == 2 && !splittedExpression[1]) {
    isLastExpression = true;
  } else {
    isLastExpression = false;
  }

  if (expressionResult.textContent) {
    lastNumber = splittedExpression[splittedExpression.length - 1];
    lastNumber = lastNumber.replace(",", ".");

    if (lastDigit == "") {
      lastDigit = lastNumber;
    }

    if (lastNumber.includes(".") || lastNumber.length >= 1) {
      isSameExpression = true;
    }

    calculateResult();
  } else {
    calculateResult();
  }

  lastDigit = lastNumber;
}

function calculateResult() {
  let completeExpression = expressionInput.value
    .replace("x", "*")
    .replace("÷", "/");

  if (completeExpression.includes(".")) {
    completeExpression = completeExpression.replace(".", "");
  } else {
    completeExpression = completeExpression.replace(",", ".");
  }

  const firstSymbol = completeExpression[0];

  if (!isLastExpression) {
    if (completeExpression.indexOf(expressionOperator) != -1) {
      let shortExpression = completeExpression;
      let result = "";

      if (expressionResult.textContent) {
        let firstNumber = expressionResult.textContent
          .replace(".", "")
          .replace(",", ".");

        if (isSameExpression && !isDeleting) {
          const diferenceBetweenExpressionNumbers = Number(
            lastNumber.slice(0, -1).replace(",", ".")
          );
          firstNumber = Number(firstNumber);

          switch (expressionOperator) {
            case "+":
              firstNumber = firstNumber - diferenceBetweenExpressionNumbers;
              break;
            case "-":
              firstNumber = firstNumber + diferenceBetweenExpressionNumbers;
              break;
            case "*":
              firstNumber = firstNumber / diferenceBetweenExpressionNumbers;
              break;
            case "/":
              firstNumber = firstNumber * diferenceBetweenExpressionNumbers;
              break;
          }
        }

        isSameExpression = false;

        if (isDeleting) {
          if (lastDigit) {
            firstNumber = Number(firstNumber);
            lastDigit = Number(lastDigit);

            switch (expressionOperator) {
              case "+":
                firstNumber = firstNumber - lastDigit;
                break;
              case "-":
                firstNumber = firstNumber + lastDigit;
                break;
              case "*":
                firstNumber = firstNumber / lastDigit;
                break;
              case "/":
                firstNumber = firstNumber * lastDigit;
                break;
            }
          }
        }

        shortExpression = firstNumber + expressionOperator + lastNumber;
      }

      let numbers = shortExpression.split(expressionOperator);

      if (isNaN(firstSymbol)) {
        shortExpression = completeExpression.slice(1);
        numbers = shortExpression.split(expressionOperator);
        numbers[0] = firstSymbol + numbers[0];
      }

      numbers = [Number(numbers[0]), Number(numbers[1])];

      switch (expressionOperator) {
        case "+": {
          result = numbers[0] + numbers[1];
          break;
        }
        case "-": {
          result = numbers[0] - numbers[1];
          break;
        }
        case "*": {
          result = numbers[0] * numbers[1];
          break;
        }
        case "/": {
          result = numbers[0] / numbers[1];
          break;
        }
      }

      result = result.toLocaleString("pt-BR");
      showResult(result);
    }
  } else {
    expressionResult.textContent = "";
    setElementsToDefaultStyling();
  }
}

function applyNewStyles() {
  expressionInput.style.height = "26.5px";
  expressionInput.style.borderRadius = "2px 2px 0 0";
  expressionInput.style.padding = "4px 8px 0 0";

  expressionResult.style.display = "block";
  expressionResult.style.borderRadius = "0 0 2px 2px";
}

function showResult(result) {
  applyNewStyles();

  expressionResult.textContent = result;
}

function setElementsToDefaultStyling() {
  expressionInput.style.height = "48px";
  expressionInput.style.transitionDuration = "0s";
  expressionInput.style.borderRadius = "2px";
  expressionInput.style.padding = "0px 8px 0 0";

  expressionResult.style.display = "none";
}

function clearExpressions() {
  expressionInput.value = "";
  expressionResult.textContent = "";
  currentExpressionNumber = "";
  firstPosition = "";

  setElementsToDefaultStyling();
}

function deleteLastSymbol() {
  if (expressionInput.value) {
    let expression = expressionInput.value;
    let expressionArray = [];
    currentExpressionNumber = "";

    for (let symbol in expression) {
      expressionArray.push(expression[symbol]);
    }

    expressionArray.pop();
    expression = expressionArray.join("");
    expressionInput.value = expression;

    for (let symbol in expression) {
      if (expression[symbol] !== ".") {
        currentExpressionNumber += expression[symbol];
      }
    }

    formatExpressionNumbers();

    isDeleting = true;
    triggerCalculation();
    isDeleting = false;

    checkAndChangeFontSize();
  }
}
