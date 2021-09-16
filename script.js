const conversionMode = document.querySelector("#conversion-mode");
const expressionInput = document.querySelector("input");
const expressionResult = document.querySelector("p");
const modalOverlay = document.querySelector(".modal-overlay");
const history = document.querySelector(".history-modal");

let expressionOperators = [];
let currentNumber = "";
let isNotCalculable = false;
let haveSeparateCalculations = false;
let firstPosition;
let operations;

function initializeInterface() {
  operations = JSON.parse(localStorage.getItem("devcalc:history")) || [];

  if (operations.length) {
    operations.forEach((operation, index) => {
      handleAddingOperationsOnHistory(operation, index);
    });
  }

  let userTheme = localStorage.getItem("userTheme");

  if (userTheme === null) {
    userTheme = "";
  }

  document.body.classList = userTheme;
  toggleImageSource(userTheme);
}

function handleKeyboardInteractions(event) {
  if (event.key !== " " && (event.key == "," || !isNaN(Number(event.key)))) {
    addNumbersOnDisplay(expressionInput.value, event.key);
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
          changeConversionMode();
          break;
        case "o":
          handleOptionsBox();
          break;
        case "h":
          if (history.classList.value.includes("invisible")) {
            handleHistoryAccess();
          }

          break;
        case "Escape":
          if (!modalOverlay.classList.value.includes("invisible")) {
            handleModalState();
          }

          break;
        case "AltGraph":
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

function handleOptionsBox() {
  const body = document.querySelector("body");
  const optionsBox = document.querySelector(".options-box");

  if (optionsBox.classList.value.includes("invisible")) {
    optionsBox.classList.remove("invisible");
    setTimeout(() => {
      body.addEventListener("click", handleOptionsBox);
    }, 50);
  } else {
    optionsBox.classList.add("invisible");
    body.removeEventListener("click", handleOptionsBox);
  }
}

function handleModalState() {
  modalOverlay.classList.toggle("invisible");

  if (modalOverlay.classList.value.includes("invisible")) {
    history.classList.add("invisible");
  }
}

function handleHistoryAccess() {
  handleModalState();

  const optionsBox = document.querySelector(".options-box");
  if (!optionsBox.classList.value.includes("invisible")) {
    handleOptionsBox();
  }
  history.classList.remove("invisible");
}

function toggleTheme() {
  applyNewStylingClasses();
  document.body.classList.toggle("dark-theme");

  const currentTheme = document.body.classList.value;
  toggleImageSource(currentTheme);

  localStorage.setItem("userTheme", currentTheme);
}

function toggleImageSource(theme) {
  const arrowLeft = document.querySelector("#arrow-left");
  const themeIcon = document.querySelector("#theme-icon");
  const optionsIcon = document.querySelector("#options-icon");
  const deleteIcon = document.querySelector("#delete-icon");

  const isDarkTheme = theme == "dark-theme";

  arrowLeft.src = isDarkTheme
    ? "assets/arrow-right-white.png"
    : "assets/arrow-right.png";
  themeIcon.src = isDarkTheme ? "assets/sun.png" : "assets/moon.png";
  optionsIcon.src = isDarkTheme
    ? "assets/options-white.png"
    : "assets/options.png";
  deleteIcon.src = isDarkTheme ? "assets/delete-dark.png" : "assets/delete.png";
}

function toggleResultMode() {
  const expression = expressionInput.value;
  const resultMode = document.querySelector("#result-mode");

  currentMode = resultMode.textContent;
  resultMode.textContent = currentMode.includes("RAD") ? "GRAU" : "RAD";

  if (
    expression.indexOf("Sin(") !== -1 ||
    expression.indexOf("Cos(") !== -1 ||
    expression.indexOf("Tan(") !== -1
  ) {
    handleCalculationResult(false);
  }
}

function changeConversionMode() {
  const modes = ["BIN", "OCT", "HEX"];
  const currentMode = conversionMode.textContent.trim();

  for (let mode in modes) {
    if (modes[mode] == currentMode) {
      conversionMode.textContent = modes[++mode];

      if (conversionMode.textContent === "") {
        conversionMode.textContent = modes[0];
      }
    }
  }
}

function addConversionModesOnInput() {
  let currentMode = [...conversionMode.textContent.trim().toLowerCase()];
  currentMode[0] = currentMode[0].toUpperCase();
  currentMode = currentMode.join("");

  handleAddingNumbersOrCharacters(`${currentMode}(`);
}

function toggleDevMode() {
  const topContainer = document.querySelector(".dev-mode-top-container");
  const conversionContainer = document.querySelector(".conversion-container");
  const sideContainer = document.querySelector(".dev-mode-side-container");

  if (conversionContainer.classList.value.includes("invisible")) {
    conversionMode.textContent = "BIN";
  }

  topContainer.classList.toggle("invisible");
  conversionContainer.classList.toggle("invisible");
  expressionInput.classList.toggle("stretch");
  sideContainer.classList.toggle("invisible");

  expressionInput.classList.remove("has-transition");
  handleFontSize(expressionInput.value);
}

function handleAddingNumbersOrCharacters(char) {
  let expression = expressionInput.value.replace(/\./g, "");

  if (char == "," || !isNaN(Number(char))) {
    addNumbersOnDisplay(expression, char);
  } else {
    addCharactersOnDisplay(expression, char);
  }
}

function addNumbersOnDisplay(expression, number) {
  const lastChar = expression[expression.length - 1];

  if (
    lastChar != ")" &&
    lastChar != "!" &&
    lastChar != "π" &&
    lastChar != "e"
  ) {
    if (number != "," || (expression.length >= 1 && !isNaN(Number(lastChar)))) {
      const canBe = checkIfCommaCanBeAdded(expression, number);

      if (canBe) {
        expressionInput.value += number;
        expression = expressionInput.value.replace(/\./g, "");

        if (isNaN(Number(expression))) {
          handleValidExpressions(expression, number);
        }
      }

      formatNumbers(expression, number);
    }

    handleFontSize(expressionInput.value);
  }
}

function checkIfCommaCanBeAdded(expression, number) {
  const numbersArray = getNumbersArray(expression);

  if (numbersArray) {
    const lastNumberPosition = numbersArray.length - 1;
    const lastNumber = numbersArray[lastNumberPosition];
    const operators = getOperatorsArray(expression);
    let commaCount;

    if (lastNumber.indexOf("Hypot(") !== -1) {
      commaCount = countCommas(lastNumber);
    }

    if (
      ((commaCount === 3 ||
        (operators.length === 1 && commaCount === 2) ||
        (operators.length === 2 && commaCount === 1)) &&
        number == ",") ||
      (lastNumber.indexOf("Hypot(") === -1 &&
        lastNumber.includes(",") &&
        number == ",")
    ) {
      return false;
    }
  }

  return true;
}

function countCommas(expression) {
  let commaCount = 0;

  for (let char in expression) {
    if (expression[char] == ",") {
      commaCount++;
    }
  }

  return commaCount;
}

function handleValidExpressions(expression, number) {
  const numbersArray = getNumbersArray(expression);

  if (numbersArray) {
    const lastNumberPosition = numbersArray.length - 1;
    const lastOperatorPosition = expressionOperators.length - 1;
    const lastNumber = numbersArray[lastNumberPosition].replace(",", ".");
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
      lastNumber == "√("
    ) {
      setDefaultStylingClasses();
      isNotCalculable = true;
    } else {
      isNotCalculable = false;
      triggerCalculation(expression, numbersArray);
    }
  }
}

function formatNumbers(expression, number = "") {
  if (expression && expression != "-") {
    const expressionArray = [...expression];

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

function addCharactersOnDisplay(expression, inputChar) {
  const lastChar = expression[expression.length - 1];
  const [openingCount, closingCount] = countParentheses(expression);

  if (
    (openingCount > closingCount && !isNaN(Number(lastChar))) ||
    (openingCount > closingCount &&
      !isNaN(Number(lastChar)) &&
      inputChar != "(") ||
    (isNaN(Number(lastChar)) &&
      lastChar != ")" &&
      inputChar != ")" &&
      inputChar != "!") ||
    ((!isNaN(Number(lastChar)) || lastChar == ")") && inputChar == "!") ||
    (lastChar == "!" && inputChar == ")")
  ) {
    if (
      inputChar == "Bin(" ||
      inputChar == "Oct(" ||
      inputChar == "Hex(" ||
      inputChar == "Fib("
    ) {
      if (expression) {
        return;
      }
    }

    if (
      (lastChar == "π" && inputChar == "π") ||
      (lastChar == "e" && inputChar == "e")
    ) {
      return;
    }

    if (
      inputChar != "(" &&
      inputChar != ")" &&
      inputChar != "!" &&
      !isNaN(Number(lastChar))
    ) {
      return;
    }

    expressionInput.value += inputChar;
  }

  if (!haveSeparateCalculations) {
    haveSeparateCalculations = true;
  }

  if (inputChar == "!" || inputChar == "π" || inputChar == "e") {
    handleCalculationResult(false);
  }

  currentNumber = "";
  handleFontSize(expression);
}

function addOperatorsOnDisplay(operator) {
  let expression = expressionInput.value;
  const [openingCount, closingCount] = countParentheses(expression);

  if (
    (openingCount > closingCount && expression[expression.length - 1] != "(") ||
    (expression.indexOf("Bin(") === -1 &&
      expression.indexOf("Oct(") === -1 &&
      expression.indexOf("Hex(") === -1 &&
      expression.indexOf("Fib(") === -1)
  ) {
    let expressionArray = [...expression];
    const lastChar = expression[expression.length - 1];

    if (!expression) {
      if (operator == "-") {
        expressionInput.value += operator;
      }
    } else {
      if (
        expression.length > 1 ||
        !isNaN(Number(lastChar)) ||
        lastChar == "π" ||
        lastChar == "e"
      ) {
        let cantAddOperators = false;

        if (
          (expression.indexOf("Log(") !== -1 &&
            expression.indexOf("Log(") + 4 === expression.length) ||
          (expression.indexOf("Ln(") !== -1 &&
            expression.indexOf("Ln(" + 3 === expression.length))
        ) {
          cantAddOperators = true;
        }

        if (!cantAddOperators) {
          operator = handleSignRule(lastChar, expressionArray, operator);

          if (openingCount === closingCount) {
            expressionOperators.push(operator);
          }

          expression = expressionArray.join("");
          expression += operator
            .replace("**", "^")
            .replace("*", "x")
            .replace("/", "÷");

          expressionInput.value = expression;
        }
      }
    }

    currentNumber = "";
    handleFontSize(expression);
  }
}

function handleSignRule(lastChar, expressionArray, operator) {
  if (
    isNaN(Number(lastChar)) &&
    lastChar != ")" &&
    lastChar != "(" &&
    lastChar != "!" &&
    lastChar != "π" &&
    lastChar != "e"
  ) {
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
  if (!isNotCalculable) {
    handleAddingOperationsOnHistory();
    setDefaultStylingClasses();
    expressionInput.value = expressionResult.textContent;
    expressionResult.textContent = "";
    currentNumber = "";
    return;
  }

  expressionInput.value = "Expressão inválida";
}

function handleAddingOperationsOnHistory(operationData = null, index = null) {
  if (!operationData) {
    const dateFormatter = Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "long",
    });

    operationData = {
      operationDate: dateFormatter.format(Date.now()),
      expression: expressionInput.value,
      result: expressionResult.textContent,
    };

    operations.push(operationData);
    localStorage.setItem("devcalc:history", JSON.stringify(operations));
  }

  let operationInfo = createOperationInfo(operationData);

  if (
    index === 0 ||
    operations.length === 1 ||
    operations[operations.length - 2].operationDate !==
      operationData.operationDate
  ) {
    const historyContent = createHistoryContent(operationData, operationInfo);
    history.appendChild(historyContent);
    return;
  }

  const operationsInfo = document.querySelector(".operations-info");
  operationsInfo.appendChild(operationInfo);
}

function createOperationInfo(operationData) {
  const operationInfo = document.createElement("div");

  const performedExpression = document.createElement("p");
  performedExpression.textContent = operationData.expression;

  const expressionResult = document.createElement("p");
  expressionResult.textContent = operationData.result;

  operationInfo.appendChild(performedExpression);
  operationInfo.appendChild(expressionResult);
  return operationInfo;
}

function createHistoryContent(operationData, operationInfo) {
  const historyContent = document.createElement("div");
  historyContent.classList.add("history-content");

  const operationsDate = document.createElement("h3");
  operationsDate.textContent = operationData.operationDate;

  const operationsInfo = document.createElement("div");
  operationsInfo.classList.add("operations-info");

  operationsInfo.appendChild(operationInfo);
  historyContent.appendChild(operationsDate);
  historyContent.append(operationsInfo);
  return historyContent;
}

function handleFontSize(expression) {
  const conversionContainer = document.querySelector(".conversion-container");

  if (!expression) {
    expression = expressionInput.value;
  }

  const fontSize = expressionInput.style.fontSize;
  const breakpoint = conversionContainer.classList.value.includes("invisible")
    ? 18
    : 25;

  if (expression.length >= breakpoint && fontSize != "16.5px") {
    expressionInput.style.fontSize = "16.5px";
  } else if (
    expression.length < breakpoint &&
    fontSize != "20px" &&
    fontSize != ""
  ) {
    expressionInput.style.fontSize = "20px";
  }
}

function triggerCalculation(expression, numbersArray) {
  const expressionArray = [...expression];

  expression = expressionArray.join("");
  const isInvalidExpression = checkIfIsInvalidExpression(
    expression,
    numbersArray
  );

  handleCalculationResult(isInvalidExpression);
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

function handleCalculationResult(isInvalidExpression) {
  const lastOperatorPosition = expressionOperators.length - 1;
  const currentOperator = expressionOperators[lastOperatorPosition];
  let expression = expressionInput.value
    .replace(/\^/g, "**")
    .replace(/\x/g, "*")
    .replace(/\÷/g, "/");

  if (!isInvalidExpression) {
    if (
      expression.indexOf(currentOperator) !== -1 ||
      haveSeparateCalculations
    ) {
      expression = expressionInput.value.replace(/\./g, "").replace(/\,/g, ".");

      const numbersArray = handleNumbersArray(expression);
      let result;

      for (number in numbersArray) {
        result = calculateResult(
          numbersArray,
          number,
          expressionOperators,
          result
        );
      }

      if (
        expression.indexOf("Bin(") === -1 &&
        expression.indexOf("Oct(") === -1 &&
        expression.indexOf("Hex(") === -1
      ) {
        result = formatExpressionResult(result);
      }

      showResult(result);
    }
  } else {
    expressionResult.textContent = "";
    setDefaultStylingClasses();
  }
}

function calculateResult(numbersArray, number, operators, result) {
  if (number > 0) {
    const currentOperator = operators[number - 1];
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
        if (numbersArray[number] === "") {
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

  return result;
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
  haveSeparateCalculations = false;
  expressionOperators = [];

  setDefaultStylingClasses();
  handleFontSize();
}

function deleteLastCharacter() {
  if (expressionInput.value) {
    let expression = expressionInput.value;
    const expressionArray = [...expression];
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

    if (expression.indexOf("(") == -1) {
      haveSeparateCalculations = false;
    }

    const lastChar = expression[expression.length - 1];

    getNewCurrentNumberValue(expression);
    formatNumbers(expression);
    handleValidExpressions(expression, lastChar);
    handleFontSize(expression);

    isNotCalculable = false;
  }
}

function handleNumbersArray(expression) {
  if (haveSeparateCalculations) {
    expression = handleSeparateCalculations(expression);
    console.log("Expressão retornada: " + expression);
  }

  let firstCharIsAnOperator = false;
  let firstChar;

  if (expression && expression[0] == "-") {
    expression = expression.slice(1);
    firstCharIsAnOperator = true;
    firstChar = "-";
  }

  const numbersArray = getNumbersArray(expression);

  if (firstCharIsAnOperator) {
    numbersArray[0] = firstChar + numbersArray[0];
  }

  return numbersArray;
}

function getNumbersArray(splittedExpression, operators = expressionOperators) {
  splittedExpression = String(splittedExpression);
  let numbersArray = Array(splittedExpression);

  for (let operator in operators) {
    const currentOperator = operators[operator]
      .replace("**", "^")
      .replace("*", "x")
      .replace("/", "÷");

    splittedExpression = splittedExpression.split(currentOperator);
    splittedExpression = splittedExpression.join(" ");
  }

  if (expressionInput.value.indexOf("Fib(") === -1) {
    numbersArray = splittedExpression.split(" ");
  }

  return numbersArray;
}

function handleSeparateCalculations(expression) {
  let newExpression = expression.replace(/\,/g, ".").replace(/\π/g, Math.PI);

  if (newExpression.indexOf("e") !== -1) {
    const previousPosition = newExpression.indexOf("e") - 1;
    const previousChar = newExpression[previousPosition];

    if (previousChar != "H") {
      newExpression = newExpression.replace(/\e/g, Math.E);
    }
  }

  let openingParenthesisCount = 0;
  let closingParenthesisCount = 0;
  let count = 0;

  while (newExpression.indexOf("(") !== -1) {
    const openingParenthesisIndex = newExpression.indexOf("(");
    const currentMode = getCurrentMode(openingParenthesisIndex, newExpression);

    const startPosition = currentMode
      ? openingParenthesisIndex - currentMode.length
      : openingParenthesisIndex;
    let partOfExpression = newExpression.slice(startPosition);
    let expressionPartContent = newExpression.slice(
      Number(openingParenthesisIndex) + 1
    );
    let closingParenthesisIndex;

    for (
      let index = openingParenthesisIndex;
      index < newExpression.length;
      index++
    ) {
      const currentChar = newExpression[index];

      if (currentChar == "(") {
        openingParenthesisCount++;
      } else if (currentChar == ")") {
        closingParenthesisCount++;

        if (openingParenthesisCount === closingParenthesisCount) {
          closingParenthesisIndex = index;
          break;
        }
      }
    }

    if (closingParenthesisIndex) {
      partOfExpression = newExpression.slice(
        startPosition,
        Number(closingParenthesisIndex) + 1
      );
      expressionPartContent = newExpression.slice(
        Number(openingParenthesisIndex) + 1,
        closingParenthesisIndex
      );
    }

    console.log("Parte da expressão: " + partOfExpression);
    console.log("Conteúdo ANTES: " + expressionPartContent);

    if (expressionPartContent.indexOf("(") !== -1) {
      console.log("CHAMOU----------------------------");
      expressionPartContent = handleSeparateCalculations(expressionPartContent);
      console.log("TERMINOU--------------------------");
    }

    if (
      expressionPartContent.indexOf("√") !== -1 ||
      expressionPartContent.indexOf("!") !== -1
    ) {
      expressionPartContent = calculateUnaryMathOperators(
        expressionPartContent
      );
    }

    const operators = getOperatorsArray(expressionPartContent);

    if (!operators.length) {
      if (currentMode) {
        if (
          currentMode == "Bin" ||
          currentMode == "Oct" ||
          currentMode == "Hex"
        ) {
          const conversionResult = calculateConversions(
            currentMode,
            expressionPartContent
          );

          console.log("Resultado da conversão: " + conversionResult);
          newExpression = newExpression.replace(
            partOfExpression,
            conversionResult
          );
        } else {
          const result = calculateMathFunctions(
            currentMode,
            expressionPartContent
          );

          console.log("Resultado do cálculo: " + result);
          newExpression = newExpression.replace(partOfExpression, result);
        }
      } else {
        newExpression = newExpression.replace(
          partOfExpression,
          expressionPartContent
        );
      }

      console.log("Nova expressão: " + newExpression);
    } else {
      const numbersArray = getNumbersArray(expressionPartContent, operators);
      let result;

      for (let number in numbersArray) {
        result = calculateResult(numbersArray, number, operators, result);
      }

      console.log("Resultado ANTES: " + result);

      if (currentMode) {
        if (result) {
          result = calculateMathFunctions(currentMode, result, operators);
        } else if (currentMode == "Hypot") {
          result = calculateMathFunctions(
            currentMode,
            expressionPartContent,
            operators
          );
        }
      }

      console.log("Resultado DEPOIS: " + result);
      newExpression = newExpression.replace(partOfExpression, result);
      console.log("Nova expressão: " + newExpression);
    }

    count++;

    if (count === 2) {
      break;
    }
  }

  if (newExpression.indexOf("√") !== -1 || newExpression.indexOf("!") !== -1) {
    newExpression = calculateUnaryMathOperators(newExpression);
  }

  return newExpression;
}

function calculateMathFunctions(currentMode, value, operators = null) {
  const resultMode = document.querySelector("#result-mode");
  let calculationResult = value;

  if (
    resultMode.textContent.trim() == "GRAU" &&
    (currentMode == "Sin" || currentMode == "Cos" || currentMode == "Tan")
  ) {
    value *= Math.PI / 180;
  }

  switch (currentMode) {
    case "Sin":
      calculationResult = Math.sin(value);
      break;
    case "Cos":
      calculationResult = Math.cos(value);
      break;
    case "Tan":
      calculationResult = Math.tan(value);
      break;
    case "Hypot":
      value = String(value);
      const commaCount = countCommas(value.replace(/\./g, ","));

      if (commaCount === 0) {
        calculationResult = Math.hypot(value);
      } else if (commaCount === 1) {
        const numbers = value.split(".");
        calculationResult = Math.hypot(...numbers);
      } else {
        value = [...value];
        const firstDotIndex = value.indexOf(".");

        if (!operators) {
          const separatorIndex = value.indexOf(".", firstDotIndex + 1);
          value.splice(separatorIndex, 1, ",");

          const numbers = value.join("").split(",");
          calculationResult = Math.hypot(...numbers);
        } else {
          const firstOperatorIndex = value.indexOf(operators[0]);

          if (firstDotIndex > firstOperatorIndex) {
            value.splice(firstDotIndex, 1, ",");

            const numbers = value.join("").split(",");
            const numbersArray = getNumbersArray(numbers[0], operators);
            let result;

            for (let number in numbersArray) {
              result = calculateResult(numbersArray, number, operators, result);
            }

            calculationResult = Math.hypot(result, numbers[1]);
          } else {
            const separatorIndex = value.indexOf(".", firstDotIndex + 1);
            value.splice(separatorIndex, 1, ",");

            const numbers = value.join("").split(",");
            const numbersArray = getNumbersArray(numbers[1], operators);
            let result;

            for (let number in numbersArray) {
              result = calculateResult(numbersArray, number, operators, result);
            }

            calculationResult = Math.hypot(numbers[0], result);
          }
        }
      }

      break;
    case "Log":
      calculationResult = Math.log10(value);
      break;
    case "Ln":
      calculationResult = Math.log(value);
      break;
    case "Fib":
      let result = "1";
      let previousNumber = 0;
      let currentNumber = 1;

      if (value > 1) {
        for (let index = 1; index < value; index++) {
          let nextNumber = previousNumber + currentNumber;

          result += `, ${nextNumber}`;
          previousNumber = currentNumber;
          currentNumber = nextNumber;
        }
      }

      calculationResult = result;
      break;
  }

  return calculationResult;
}

function calculateConversions(currentMode, valueToConvert) {
  let convertedValue;

  switch (currentMode) {
    case "Bin":
      convertedValue = (valueToConvert >>> 0).toString(2);
      break;
    case "Oct":
      convertedValue = Number(valueToConvert).toString(8);
      break;
    case "Hex":
      convertedValue = Number(valueToConvert).toString(16).toUpperCase();
      break;
  }

  return convertedValue;
}

function calculateUnaryMathOperators(expression) {
  const expressionArray = [...expression];

  for (let char in expression) {
    const currentChar = expression[char];

    if (currentChar == "√" || currentChar == "!") {
      switch (currentChar) {
        case "√":
          const startIndex = expressionArray.indexOf("√");
          const nextIndex = Number(char) + 1;
          let slicedExpression = expression.slice(nextIndex);

          if (slicedExpression) {
            let expressionPartContent = "";

            for (let char in slicedExpression) {
              const currentChar = slicedExpression[char];

              if (isNaN(Number(currentChar))) {
                break;
              }

              expressionPartContent += slicedExpression[char];
            }

            const result = Math.sqrt(Number(expressionPartContent));

            expressionArray.splice(
              startIndex,
              String(expressionPartContent).length + 1,
              result
            );
          }

          break;
        case "!":
          const reversedExpression = [...expressionArray].reverse();
          const factorialNumbers = [];
          let currentNumber = "";
          let exclamationIndex;

          for (let char in reversedExpression) {
            const currentChar = reversedExpression[char];

            if (currentChar == "!") {
              exclamationIndex = char;
            } else if (exclamationIndex) {
              if (currentChar != "." && isNaN(Number(currentChar))) {
                exclamationIndex = "";
                factorialNumbers.push(Number(currentNumber));
                currentNumber = "";
              } else {
                currentNumber += currentChar;
              }
            }
          }

          if (currentNumber) {
            factorialNumbers.push(currentNumber);
          }

          let results = [];

          for (let number in factorialNumbers) {
            const currentFactorialNumber = factorialNumbers[number];
            let result = currentFactorialNumber;

            for (let index = currentFactorialNumber - 1; index > 0; index--) {
              result *= index;
            }

            results.push(result);
          }

          results = results.reverse();
          let position = 0;

          for (let char in expressionArray) {
            const currentChar = expressionArray[char];

            if (currentChar == "!") {
              const firstDigitIndex =
                char - String(factorialNumbers[position]).length;
              let deleteAmount = char - firstDigitIndex + 1;

              expressionArray.splice(
                firstDigitIndex,
                deleteAmount,
                results[position]
              );

              position++;
            }
          }

          break;
      }
    }
  }

  return expressionArray.join("");
}

function getCurrentMode(openingParenthesisIndex, expression) {
  let previousIndex = openingParenthesisIndex - 1;
  const previousChar = expression[previousIndex];
  let currentMode = "";

  if (previousChar != "(" && expressionOperators.indexOf(previousChar) === -1) {
    for (let index = previousIndex; index > -1; index--) {
      let currentChar = expression[index].replace("^", "**").replace("÷", "/");

      if (currentChar == "x" && !isNaN(Number(expression[index - 1]))) {
        console.log(expression[index - 1]);
        currentChar = currentChar.replace("x", "*");
      }

      if (
        !isNaN(Number(currentChar)) ||
        currentChar == "+" ||
        currentChar == "-" ||
        currentChar == "*" ||
        currentChar == "/" ||
        currentChar == "%" ||
        currentChar == "√"
      ) {
        break;
      }

      currentMode += expression[index];
    }

    currentMode = [...currentMode].reverse().join("");
    return currentMode;
  }
}

function countParentheses(expression, getClosingIndex = false) {
  let openingCount = 0;
  let closingCount = 0;
  let closingIndex;

  for (let char in expression) {
    if (expression[char] == "(") {
      openingCount++;
    } else if (expression[char] == ")") {
      closingCount++;

      if (getClosingIndex && !closingIndex && closingCount > openingCount) {
        closingIndex = char;

        return [openingCount, closingCount, closingIndex];
      }
    }
  }

  return [openingCount, closingCount];
}

function getOperatorsArray(expression) {
  const operators = [];

  for (let char in expression) {
    const currentChar = expression[char]
      .replace("x", "*")
      .replace("^", "**")
      .replace("÷", "/");
    const previousChar = expression[char - 1];

    if (
      !isNaN(Number(previousChar)) &&
      (currentChar == "+" ||
        currentChar == "-" ||
        currentChar == "*" ||
        currentChar == "**" ||
        currentChar == "/" ||
        currentChar == "%")
    ) {
      operators.push(currentChar);
    }
  }

  return operators;
}

function getNewCurrentNumberValue(expression) {
  currentNumber = "";

  for (let char in expression) {
    if (expression[char] !== "." && char >= firstPosition) {
      currentNumber += expression[char];
    }
  }
}
