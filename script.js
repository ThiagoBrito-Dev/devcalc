const conversionMode = document.querySelector("#conversion-mode");
const expressionInput = document.querySelector("input");
const expressionResult = document.querySelector("p");

let expressionOperators = [];
let currentNumber = "";
let isNotCalculable = false;
let haveSeparateCalculations = false;
let currentMode;
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
          deleteLastCharacter();
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
  const lastChar = expression[expression.length - 1];

  if (lastChar != ")") {
    if (number != "," || (expression.length >= 1 && !isNaN(Number(lastChar)))) {
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
    handleFontSize(expressionInput.value);
  }
}

function checkIfCommaCanBeAdded(expression, number) {
  const numbersArray = getNumbersArray(expression);
  const lastNumberPosition = numbersArray.length - 1;
  const lastNumber = numbersArray[lastNumberPosition];

  if (
    (expression.includes(",") && number == ",") ||
    (lastNumber.includes(",") && number == ",")
  ) {
    return false;
  }

  return true;
}

function handleValidExpressions(expression, number) {
  const lastOperatorPosition = expressionOperators.length - 1;
  const currentOperator = expressionOperators[lastOperatorPosition];
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
    (currentOperator == "/" &&
      ((previousChar == "0" && number == ",") ||
        (previousChar == "," && number == "0") ||
        (previousChar == "0" && number == "0")))
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

  for (char in formattedNumber) {
    if (formattedNumber[char] != ".") {
      unformattedNumber += formattedNumber[char];
    }
  }

  return unformattedNumber;
}

function addCharactersOnDisplay(char) {
  expressionInput.value += char;

  if (!haveSeparateCalculations) {
    haveSeparateCalculations = true;
  }

  currentNumber = "";
}

function addOperatorsOnDisplay(operator) {
  let expression = expressionInput.value;
  let expressionArray = getExpressionArray(expression);
  const lastChar = expression[expression.length - 1];

  if (!expression) {
    if (operator == "-" || operator == "√") {
      expressionInput.value += operator;
    }
  } else {
    if (expression.length > 1 || !isNaN(Number(lastChar))) {
      operator = handleSignRule(lastChar, expressionArray, operator);
      expressionOperators.push(operator);

      expression = expressionArray.join("");
      expression += operator
        .replace("**", "^")
        .replace("*", "x")
        .replace("/", "÷");

      expressionInput.value = expression;
    }
  }

  currentNumber = "";
  handleFontSize(expression);
}

function handleSignRule(lastChar, expressionArray, operator) {
  if (isNaN(Number(lastChar)) && lastChar != ")") {
    expressionArray.pop();
    expressionOperators.pop();

    if (lastChar == "-" && operator == "-") {
      operator = "+";
    } else if (lastChar == "-" && operator == "+") {
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
  const expressionArray = getExpressionArray(expression);
  const numbersArray = getNumbersArray(expression);

  expression = expressionArray.join("");
  const isInvalidExpression = checkIfIsInvalidExpression(
    expression,
    numbersArray
  );

  calculateResult(isInvalidExpression);
}

function checkIfIsInvalidExpression(expression, numbersArray) {
  const lastOperatorPosition = expressionOperators.length - 1;
  const currentOperator = expressionOperators[lastOperatorPosition];
  let splittedExpression = expression.split(currentOperator);

  if (numbersArray.length == 2 && !numbersArray[1] && !splittedExpression[1]) {
    return true;
  }

  return false;
}

function calculateResult(isInvalidExpression) {
  const lastOperatorPosition = expressionOperators.length - 1;
  const currentOperator = expressionOperators[lastOperatorPosition];
  let expression = getExpressionArray(expressionInput.value, true).join("");

  if (!isInvalidExpression) {
    if (expression.indexOf(currentOperator) != -1) {
      expression = getExpressionArray(expressionInput.value).join("");
      expression = unformatNumbers(expression).replace(",", ".");

      const numbersArray = getNumbersArray(expression);
      let result = "";

      for (number in numbersArray) {
        if (number != 0) {
          const currentOperator = expressionOperators[number - 1];
          let currentNumber = Number(numbersArray[number]);
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
              if (numbersArray[number] == "") {
                currentNumber = 1;
              }

              result = result / currentNumber;
              break;
            case "%":
              result = (currentNumber * result) / 100;
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

function formatExpressionResult(result) {
  const lastOperatorPosition = expressionOperators.length - 1;
  const currentOperator = expressionOperators[lastOperatorPosition];

  if (currentOperator == "**" && String(result).includes(".")) {
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
  isNotCalculable = false;
  expressionOperators = [];

  setDefaultStylingClasses();
  handleFontSize();
}

function deleteLastCharacter() {
  if (expressionInput.value) {
    let expression = expressionInput.value;
    const expressionArray = getExpressionArray(expression);
    const lastPositions = [
      expressionArray.length - 1,
      expressionOperators.length - 1,
    ];

    const lastExpressionChar = expressionArray[lastPositions[0]]
      .replace("x", "*")
      .replace("^", "**")
      .replace("÷", "/");
    const lastOperator = expressionOperators[lastPositions[1]];

    if (lastExpressionChar == lastOperator) {
      expressionOperators.pop();
    }

    expressionArray.pop();
    expression = expressionArray.join("");
    expressionInput.value = expression;
    const lastChar = expression[expression.length - 1];

    getNewCurrentNumberValue(expression);
    formatNumbers(expression);
    handleValidExpressions(expression, lastChar);
    handleFontSize(expression);

    isNotCalculable = false;
  }
}

function getExpressionArray(expression, formatOperators = false) {
  const expressionArray = [];
  let currentChar;

  for (let char in expression) {
    currentChar = expression[char];

    if (formatOperators) {
      if (
        expression[char] != "," &&
        expression[char] != "." &&
        isNaN(Number(expression[char]))
      ) {
        currentChar = handleOperators(currentChar);
      }
    }

    expressionArray.push(currentChar);
  }

  return expressionArray;
}

function getNumbersArray(expression) {
  let splittedExpression = expression;

  if (haveSeparateCalculations) {
    splittedExpression = calculatePartsOfExpression(splittedExpression);
  }

  console.log("Expressão separada: " + splittedExpression);

  let firstCharIsAnOperator = false;
  let firstChar;

  if (splittedExpression && splittedExpression[0] == "-") {
    splittedExpression = splittedExpression.slice(1);
    firstCharIsAnOperator = true;
    firstChar = "-";
  }

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

  // console.log("Expressão separada depois: " + splittedExpression);
  // console.log("Array de números: ", numbersArray);

  if (firstCharIsAnOperator) {
    numbersArray[0] = firstChar + numbersArray[0];
  }

  return numbersArray;
}

function calculatePartsOfExpression(expression) {
  const expressionArray = getExpressionArray(expression);
  const currentOperator = expressionOperators[expressionOperators.length - 1];
  const openParenthesisIndex = expression.indexOf("(");
  let partOfExpression = expression.slice(openParenthesisIndex + 1);
  let closeParenthesisIndex;

  if (expression.indexOf(")") != -1) {
    closeParenthesisIndex = expression.indexOf(")");
    partOfExpression = expression.slice(
      openParenthesisIndex + 1,
      closeParenthesisIndex
    );
  }

  partOfExpression = partOfExpression.replace("x", "*");
  let result = partOfExpression;

  if (isNaN(Number(partOfExpression))) {
    const numbers = partOfExpression.split(currentOperator);
    const firstNumber = Number(numbers[0]);
    const secondNumber = Number(numbers[1]);

    switch (currentOperator) {
      case "*":
        result = firstNumber * secondNumber;
        break;
    }
  }

  expressionArray.splice(
    openParenthesisIndex,
    partOfExpression.length + 2,
    result
  );
  expression = expressionArray.join("");

  return expression;
}

function handleOperators(char) {
  switch (char) {
    case "x":
      char = "*";
      break;
    case "^":
      char = "**";
      break;
    case "÷":
      char = "/";
      break;
  }

  return char;
}

function getNewCurrentNumberValue(expression) {
  currentNumber = "";

  for (let char in expression) {
    if (expression[char] !== "." && char >= firstPosition) {
      currentNumber += expression[char];
    }
  }
}
