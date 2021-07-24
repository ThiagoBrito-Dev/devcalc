const conversionMode = document.querySelector("#conversion-mode");
const expressionInput = document.querySelector("input");
const expressionResult = document.querySelector("p");

let expressionOperators = [];
let currentNumber = "";
let isSameNumber = false;
let isDeleting = false;
let isNotCalculable = false;
let currentMode;
let lastExpNumber;
let firstValue;
let previousLastExpNumber;
let firstPosition;

function initializeInterface() {
  const calcContainer = document.querySelector("main");
  const userTheme = localStorage.getItem("userTheme");

  document.body.classList = userTheme;
  toggleImageSource(userTheme);

  calcContainer.classList.add("visible");
}

function handleKeyboardInteractions(event) {
  if (event.key == "," || !isNaN(Number(event.key))) {
    addNumbersOnDisplay(event.key);
  } else {
    let key;

    switch (event.key) {
      case "+":
        key = event.key;
        break;
      case "-":
        key = event.key;
        break;
      case "*":
        key = event.key;
        break;
      case "^":
        key = event.key;
        break;
      case "/":
        key = event.key;
        break;
      case "%":
        key = event.key;
        break;
    }

    if (key) {
      addOperatorsOnDisplay(key);
    } else {
      switch (event.key) {
        case "r":
          toggleResultMode();
          break;
        case "t":
          toggleTheme();
          break;
        case "l":
          clearExpressions();
          break;
        case "c":
          if (conversionMode.classList.value != "invisible") {
            handleConversionMode();
          }

          break;
        case "Control":
          toggleDevMode();
          break;
        case "Backspace":
          deleteLastSymbol();
          break;
        case "Enter":
          focalizeResult();
          break;
      }
    }
  }
}

function toggleTheme() {
  applyNewStylingClasses();
  document.body.classList.toggle("dark-theme");

  const currentTheme = document.body.classList.value;
  toggleImageSource(currentTheme);

  localStorage.setItem("userTheme", currentTheme);
}

function toggleImageSource(theme) {
  const themeIcon = document.querySelector("#theme-icon");
  const optionsIcon = document.querySelector("#options-icon");
  const deleteIcon = document.querySelector("#delete-icon");

  const isDarkTheme = theme == "dark-theme";

  themeIcon.src = isDarkTheme ? "assets/sun.png" : "assets/moon.png";
  optionsIcon.src = isDarkTheme
    ? "assets/options-white.png"
    : "assets/options.png";
  deleteIcon.src = isDarkTheme ? "assets/delete-dark.png" : "assets/delete.png";
}

function toggleResultMode() {
  const resultMode = document.querySelector("#result-mode");

  currentMode = resultMode.textContent;
  resultMode.textContent = currentMode.includes("RAD") ? "GRAU" : "RAD";
}

function handleConversionMode() {
  const modes = ["DECI", "BIN", "OCT", "HEX"];

  if (!conversionMode.textContent.includes(" ")) {
    const currentMode = conversionMode.textContent;

    for (let mode in modes) {
      if (modes[mode] == currentMode) {
        conversionMode.textContent = modes[++mode];

        if (conversionMode.textContent === "") {
          conversionMode.textContent = modes[0];
        }
      }
    }
  } else {
    conversionMode.textContent = "DECI";
  }

  handleAddingNumbersOrCharacters(
    `${conversionMode.textContent}(`.toLowerCase()
  );
}

function toggleDevMode() {
  const topContainer = document.querySelector(".dev-mode-top-container");
  const sideContainer = document.querySelector(".dev-mode-side-container");

  if (conversionMode.classList.value != "invisible") {
    conversionMode.textContent = "DECI";
  }

  conversionMode.classList.toggle("invisible");
  expressionInput.classList.toggle("stretch");
  topContainer.classList.toggle("invisible");
  sideContainer.classList.toggle("invisible");

  expressionInput.classList.remove("has-transition");
}

function handleAddingNumbersOrCharacters(char) {
  if (char == "," || !isNaN(Number(char))) {
    addNumbersOnDisplay(char);
  } else {
    addCharactersOnDisplay(char);
  }
}

function addNumbersOnDisplay(number) {
  let expression = unformatNumbers(expressionInput.value);
  const lastSymbol = Number(expression[expression.length - 1]);

  if (number != "," || (expression.length >= 1 && !isNaN(lastSymbol))) {
    const canBe = checkIfCommaCanBeAdded(expression, number);

    if (canBe) {
      expressionInput.value += number;
      expression = unformatNumbers(expressionInput.value);

      if (isNaN(Number(expression))) {
        handleValidExpressions(expression, number);
      }
    }
  }

  formatNumbers(expression, number);
  handleFontSize(expression);
}

function checkIfCommaCanBeAdded(expression, number) {
  const expResult = expressionResult.textContent;

  if (!expResult) {
    if (expression.includes(",") && number == ",") {
      return false;
    }
  } else if (lastExpNumber) {
    if (lastExpNumber.includes(".") && number == ",") {
      return false;
    }
  }

  return true;
}

function handleValidExpressions(expression, number) {
  const lastPosition = expressionOperators.length - 1;
  const currentOperator = expressionOperators[lastPosition];
  let previousChar = expression[expression.length - 2];

  if (previousChar) {
    previousChar = previousChar
      .replace("x", "*")
      .replace("^", "**")
      .replace("÷", "/");
  }

  if (
    (currentOperator == "/" &&
      number == "0" &&
      expressionOperators.indexOf(previousChar) != -1) ||
    (previousChar == "0" && number == ",") ||
    (previousChar == "," && number == "0") ||
    (previousChar == "0" && number == "0")
  ) {
    setDefaultStylingClasses();
    isNotCalculable = true;
  } else {
    isNotCalculable = false;
    triggerCalculation(expression);
  }
}

function formatNumbers(expression, number = "") {
  if (expression && expression != "-") {
    const expressionArray = getExpressionArray(expression);

    if (currentNumber == "") {
      firstPosition = expression.indexOf(number, expression.length - 1);
    }

    currentNumber += number;

    if (!expression.includes(",") && currentNumber) {
      const formattedNumber = Number(currentNumber).toLocaleString("pt-BR");

      addFormattedNumbersOnDisplay(expressionArray, formattedNumber);
    }
  }
}

function addFormattedNumbersOnDisplay(expressionArray, formattedNumber) {
  const lastPosition = formattedNumber.length + 1;

  expressionArray.splice(firstPosition, lastPosition, formattedNumber);
  expressionInput.value = expressionArray.join("");
}

function unformatNumbers(formattedNumber) {
  let unformattedNumber = "";

  for (symbol in formattedNumber) {
    if (formattedNumber[symbol] != ".") {
      unformattedNumber += formattedNumber[symbol];
    }
  }

  return unformattedNumber;
}

function addCharactersOnDisplay(char) {
  expressionInput.value = char;
}

function addOperatorsOnDisplay(operator) {
  let expression = expressionInput.value;
  const expressionArray = getExpressionArray(expression);
  const lastSymbol = expression[expression.length - 1];

  if (!expression) {
    if (operator == "-" || operator == "√") {
      expressionInput.value += operator;
    }
  } else {
    if (expression.length > 1 || !isNaN(Number(lastSymbol))) {
      operator = handleSignRule(lastSymbol, expressionArray, operator);
      expressionOperators.push(operator);

      expression = expressionArray.join("");
      expression += operator;
      expressionInput.value = expression
        .replace("**", "^")
        .replace("*", "x")
        .replace("/", "÷");
    }
  }

  currentNumber = "";
  handleFontSize(expression);
}

function handleSignRule(lastSymbol, expressionArray, operator) {
  if (isNaN(Number(lastSymbol))) {
    expressionArray.pop();

    if (lastSymbol == "-" && operator == "-") {
      operator = "+";
    } else if (lastSymbol == "-" && operator == "+") {
      operator = "-";
    }
  }

  return operator;
}

function focalizeResult() {
  expressionInput.value = "Expressão inválida";

  if (!isNotCalculable) {
    setDefaultStylingClasses();
    expressionInput.value = expressionResult.textContent;
    expressionResult.textContent = "";
    currentNumber = "";
  }
}

function handleFontSize(expression) {
  if (!expression) {
    expression = expressionInput.value;
  }

  const fontSize = expressionInput.style.fontSize;

  if (expression.length >= 18 && fontSize != "16.5px") {
    expressionInput.style.fontSize = "16.5px";
  } else if (expression.length < 18 && fontSize != "20px" && fontSize != "") {
    expressionInput.style.fontSize = "20px";
  }
}

function triggerCalculation(expression) {
  const expResult = expressionResult.textContent;
  const expressionArray = getExpressionArray(expression);
  const numbersArray = getNumbersArray(expression);
  let isInvalidExpression;

  expression = expressionArray.join("");

  [isInvalidExpression, lastExpNumber] = checkIfIsInvalidExpression(
    expression,
    numbersArray
  );

  if (expResult) {
    isInvalidExpression = handleLastExpressionNumbers(
      expressionArray,
      isInvalidExpression,
      expression,
      numbersArray
    );

    console.log("É inválida? " + isInvalidExpression);
    calculateResult(isInvalidExpression);
  } else {
    console.log("É inválida? " + isInvalidExpression);
    calculateResult(isInvalidExpression);
  }

  previousLastExpNumber = lastExpNumber;
}

function handleLastExpressionNumbers(
  expressionArray,
  isInvalidExpression,
  expression,
  numbersArray
) {
  if (isNaN(Number(lastExpNumber)) || isDeleting) {
    handleLastOperator(expressionArray.reverse());

    [isInvalidExpression, lastExpNumber] = checkIfIsInvalidExpression(
      expression,
      numbersArray
    );
  }

  if (previousLastExpNumber == "") {
    previousLastExpNumber = lastExpNumber;
  }

  if (lastExpNumber.includes(".") || lastExpNumber.length > 1) {
    isSameNumber = true;
  }

  return isInvalidExpression;
}

function handleLastOperator(reversedExpressionArray) {
  let lastOperator;

  for (let symbol in reversedExpressionArray) {
    if (!lastOperator) {
      if (
        reversedExpressionArray[symbol] != "," &&
        reversedExpressionArray[symbol] != "." &&
        isNaN(Number(reversedExpressionArray[symbol]))
      ) {
        lastOperator = reversedExpressionArray[symbol];
        lastOperator = lastOperator
          .replace("^", "**")
          .replace("x", "*")
          .replace("÷", "/");
        expressionOperators[expressionOperators.length - 1] = lastOperator;
      }
    }
  }
}

function checkIfIsInvalidExpression(expression, numbersArray) {
  let splittedExpression = expression.split(
    expressionOperators[expressionOperators.length - 1]
  );

  lastExpNumber = getLastExpressionNumber(splittedExpression);

  if (numbersArray.length == 2 && !splittedExpression[1]) {
    return [true, lastExpNumber];
  }

  return [false, lastExpNumber];
}

function getLastExpressionNumber(splittedExpression) {
  lastExpNumber = splittedExpression[splittedExpression.length - 1];
  lastExpNumber = lastExpNumber.replace(",", ".");

  return lastExpNumber;
}

function calculateResult(isInvalidExpression) {
  let completeExpression = expressionInput.value
    .replace("^", "**")
    .replace("x", "*")
    .replace("÷", "/");

  if (completeExpression.includes(".")) {
    completeExpression = completeExpression.replace(".", "");
  } else {
    completeExpression = completeExpression.replace(",", ".");
  }

  if (!isInvalidExpression) {
    if (
      completeExpression.indexOf(
        expressionOperators[expressionOperators.length - 1]
      ) != -1
    ) {
      let result = "";
      const expression = getExpressionArray(expressionInput.value).join("");
      const numbersArray = getNumbersArray(expression);

      for (number in numbersArray) {
        if (number != 0) {
          const currentOperator = expressionOperators[number - 1];
          let currentNumber = Number(numbersArray[number].replace(",", "."));
          result = Number(result);

          switch (currentOperator) {
            case "+":
              result = result + currentNumber;
              break;
            case "-":
              result = result - currentNumber;
              break;
            case "*":
              if (numbersArray[number] === "") {
                currentNumber = 1;
              }

              result = result * currentNumber;
              break;
            case "**":
              if (numbersArray[number] === "") {
                currentNumber = 1;
              }

              result = result ** currentNumber;
              break;
            case "/":
              console.log("Número atual" + currentNumber);
              if (currentNumber === 0 || numbersArray[number] == "") {
                currentNumber = 1;
              }

              result = result / currentNumber;
              break;
            case "%":
              result = (result * currentNumber) / 100;
              break;
          }
        } else {
          result = numbersArray[number];
        }
      }

      result = formatExpressionResult(result);
      showResult(result);
    }
  } else {
    expressionResult.textContent = "";
    setDefaultStylingClasses();
  }
}

function handleFirstExpressionNumberWhenAdding(firstNumber) {
  isSameNumber = false;

  let diferenceBetweenExpressionNumbers = Number(
    lastExpNumber.slice(0, -1).replace(",", ".")
  );
  firstNumber = Number(firstNumber);

  if (
    firstValue != 0 &&
    expressionOperators[expressionOperators.length - 1] == "*" &&
    firstNumber == 0
  ) {
    firstNumber = firstValue;
  }

  switch (expressionOperators[expressionOperators.length - 1]) {
    case "+":
      firstNumber = firstNumber - diferenceBetweenExpressionNumbers;
      break;
    case "-":
      firstNumber = firstNumber + diferenceBetweenExpressionNumbers;
      break;
    case "*":
      if (!diferenceBetweenExpressionNumbers) {
        diferenceBetweenExpressionNumbers = 1;
      }

      firstNumber = firstNumber / diferenceBetweenExpressionNumbers;
      break;
    case "**":
      firstNumber = firstValue;
      break;
    case "/":
      if (!diferenceBetweenExpressionNumbers) {
        diferenceBetweenExpressionNumbers = 1;
      }

      firstNumber = firstNumber * diferenceBetweenExpressionNumbers;
      break;
    case "%":
      firstNumber = firstValue;
      break;
  }

  return firstNumber;
}

function handleFirstExpressionNumberWhenDeleting(firstNumber) {
  firstNumber = Number(firstNumber);
  previousLastExpNumber = Number(previousLastExpNumber);

  switch (expressionOperators[expressionOperators.length - 1]) {
    case "+":
      firstNumber = firstNumber - previousLastExpNumber;
      break;
    case "-":
      firstNumber = firstNumber + previousLastExpNumber;
      break;
    case "*":
      firstNumber = firstNumber / previousLastExpNumber;
      break;
    case "**":
      firstNumber = firstValue;
      break;
    case "/":
      firstNumber = firstNumber * previousLastExpNumber;
      break;
    case "%":
      firstNumber = firstValue;
      break;
  }

  return firstNumber;
}

function formatExpressionResult(result) {
  if (
    expressionOperators[expressionOperators.length - 1] == "**" &&
    String(result).includes(".")
  ) {
    result = String(result).replace(".", ",");

    const splittedResult = result.split(",");
    splittedResult[0] = Number(splittedResult[0]).toLocaleString("pt-BR");

    result = splittedResult.join(",");
  } else {
    result = result.toLocaleString("pt-BR");
  }

  return result;
}

function applyNewStylingClasses(result) {
  expressionInput.classList.add("has-transition");
  expressionResult.classList.add("has-transition");

  if (result) {
    expressionInput.classList.add("has-result");

    expressionInput.classList.remove("has-transition");
    expressionResult.classList.remove("invisible");
    expressionResult.classList.remove("has-transition");
  }
}

function showResult(result) {
  applyNewStylingClasses(result);

  expressionResult.textContent = result;
}

function setDefaultStylingClasses() {
  expressionResult.classList.add("invisible");

  expressionInput.classList.remove("has-result", "has-transition");
  expressionResult.classList.remove("has-transition");
}

function clearExpressions() {
  expressionInput.value = "";
  expressionResult.textContent = "";
  currentNumber = "";
  firstPosition = "";
  lastExpNumber = "";
  isNotCalculable = false;
  expressionOperators = [];

  setDefaultStylingClasses();
  handleFontSize();
}

function deleteLastSymbol() {
  if (expressionInput.value) {
    let expression = expressionInput.value;
    const expressionArray = getExpressionArray(expression);
    const lastPositions = [
      expressionArray.length - 1,
      expressionOperators.length - 1,
    ];

    if (
      expressionArray[lastPositions[0]] ===
      expressionOperators[lastPositions[1]]
    ) {
      expressionOperators.pop();
    }

    expressionArray.pop();
    expression = expressionArray.join("");
    expressionInput.value = expression;
    const lastChar = expression[expression.length - 1];

    getNewCurrentNumberValue(expression);

    isDeleting = true;
    formatNumbers(expression);
    handleValidExpressions(expression, lastChar);
    isDeleting = false;
    isNotCalculable = false;

    handleFontSize(expression);
  }
}

function getExpressionArray(expression, formatOperators = false) {
  const expressionArray = [];
  let char;

  for (let symbol in expression) {
    char = expression[symbol];

    if (formatOperators) {
      if (
        expression[symbol] != "," &&
        expression[symbol] != "." &&
        isNaN(Number(expression[symbol]))
      ) {
        char = handleOperators(char);
      }
    }

    expressionArray.push(char);
  }

  return expressionArray;
}

function getNumbersArray(expression) {
  let splittedExpression = expression;
  let numbersArray = [];

  for (let operator in expressionOperators) {
    const currentOperator = expressionOperators[operator]
      .replace("**", "^")
      .replace("*", "x")
      .replace("/", "÷");

    splittedExpression = splittedExpression.split(currentOperator);
    splittedExpression = splittedExpression.join(" ");
  }

  numbersArray = splittedExpression.split(" ");
  return numbersArray;
}

function handleOperators(char) {
  switch (char) {
    case "x":
      char = "*";
      break;
    case "÷":
      char = "/";
      break;
    case "^":
      char = "**";
  }

  return char;
}

function getNewCurrentNumberValue(expression) {
  currentNumber = "";

  for (let symbol in expression) {
    if (expression[symbol] !== "." && symbol >= firstPosition) {
      currentNumber += expression[symbol];
    }
  }
}
