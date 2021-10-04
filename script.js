const conversionMode = document.querySelector("#conversion-mode");
const expressionInput = document.querySelector("input");
const expressionResult = document.querySelector("p");

const optionsBox = document.querySelector(".options-box");
const modalOverlay = document.querySelector(".modal-overlay");
const modal = document.querySelector(".modal-overlay section");
const modalTitle = document.querySelector("#modal-title");
const historyModalContent = document.querySelector(".history-modal-content");
const shortcutsModalContent = document.querySelector(
  ".shortcuts-modal-content"
);
const personalizationModalContent = document.querySelector(
  ".personalization-modal-content"
);

let expressionOperators = [];
let currentNumber = "";
let isNotCalculable = false;
let haveSeparateCalculations = false;
let firstPosition;
let operations;

function initializeInterface() {
  operations = JSON.parse(localStorage.getItem("devcalc-history")) || [];

  if (operations.length) {
    operations.forEach((operation, index) => {
      handleAddingOperationsOnHistory(operation, index);
    });
  }

  let userTheme = localStorage.getItem("devcalc-userDefaultTheme");
  if (userTheme === null) {
    userTheme = "";
  }

  const attributeName =
    userTheme !== "" && userTheme != "dark-theme" ? "style" : "class";

  document.body.setAttribute(attributeName, userTheme);
  toggleThemeIcon(userTheme);
  handleCurrentInputColor();
}

function handleKeyboardShortcuts(event) {
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
          if (historyModalContent.classList.value.includes("invisible")) {
            handleHistoryAccess();
          }

          break;
        case "a":
          if (shortcutsModalContent.classList.value.includes("invisible")) {
            handleShortcutsAccess();
          }

          break;
        case "p":
          if (
            personalizationModalContent.classList.value.includes("invisible")
          ) {
            handlePersonalizationAccess();
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

function clearModal() {
  modal.classList.value = "";
  modalTitle.textContent = "";
  historyModalContent.classList.add("invisible");
  shortcutsModalContent.classList.add("invisible");
  personalizationModalContent.classList.add("invisible");
}

function handleModalVisibilityConflicts() {
  !modalOverlay.classList.value.includes("invisible")
    ? clearModal()
    : handleModalState();

  if (!optionsBox.classList.value.includes("invisible")) {
    handleOptionsBox();
  }
}

function handleModalState() {
  if (!modalOverlay.classList.value.includes("invisible")) {
    clearModal();
  }

  modalOverlay.classList.toggle("invisible");
}

function handleHistoryAccess() {
  handleModalVisibilityConflicts();
  modal.classList.add("history-modal");
  modalTitle.textContent = "Histórico";
  historyModalContent.classList.remove("invisible");
}

function handleShortcutsAccess() {
  handleModalVisibilityConflicts();
  modal.classList.add("shortcuts-modal");
  modalTitle.textContent = "Atalhos do Teclado";
  shortcutsModalContent.classList.remove("invisible");
}

function handlePersonalizationAccess() {
  handleModalVisibilityConflicts();
  modal.classList.add("personalization-modal");
  modalTitle.textContent = "Personalização";
  personalizationModalContent.classList.remove("invisible");
}

function handleCurrentInputColor() {
  const cssVariables = [
    "--calc-background", // primary
    "--input-text", // primary
    "--input-background", // primary
    "--p-text", // primary
    "--button-text", // primary
    "--button-background", // primary
    "--mode-button-text", // secondary
    "--mode-button-background", // secondary
    "--colorized-button-background", // secondary
    "--header-line", // tertiary
    "--button-background-effect", // tertiary
    "--button-border", // tertiary
  ];
  const bodyTheme = document.body.classList.value.includes("dark-theme")
    ? ".dark-theme"
    : "body";

  cssVariables.forEach((variable, index) => {
    const currentColor = getComputedStyle(
      document.querySelector(bodyTheme)
    ).getPropertyValue(variable);
    const currentColorTableData = document.querySelector(
      `table tbody tr:nth-child(${index + 1}) td.current-color-data`
    );

    const currentColorInput = document.createElement("input");
    currentColorInput.setAttribute("type", "text");
    currentColorInput.setAttribute("readonly", "true");
    currentColorInput.classList.add("current-color");
    currentColorInput.classList.add("has-transition");
    currentColorInput.style.backgroundColor = currentColor;

    currentColorInput.addEventListener(
      "dblclick",
      copyCurrentColorToNewColorField
    );

    currentColorTableData.childNodes.length
      ? currentColorTableData.replaceChild(
          currentColorInput,
          currentColorTableData.querySelector("input.current-color")
        )
      : currentColorTableData.appendChild(currentColorInput);
  });
}

function copyCurrentColorToNewColorField(event) {
  const unformattedCurrentColor = event.target.style.backgroundColor;
  const splittedCurrentColor = unformattedCurrentColor
    .replace(/[^0-9\,]/g, "")
    .split(",");
  let formattedCurrentColor = "#";

  splittedCurrentColor.forEach((colorChannelValue) => {
    let convertedColorChannelValue = calculateConversions(
      "Hex",
      colorChannelValue
    );

    if (convertedColorChannelValue.length % 2 === 1) {
      convertedColorChannelValue = "0" + convertedColorChannelValue;
    }

    formattedCurrentColor += convertedColorChannelValue;
  });

  const targetParentSibling = event.target.parentElement.nextElementSibling;
  const fakeNewColorInput =
    targetParentSibling.querySelector("input[type='text']");
  const newColorInput = targetParentSibling.querySelector(
    "input[type='color']"
  );

  fakeNewColorInput.style.backgroundColor = formattedCurrentColor;
  newColorInput.value = formattedCurrentColor;
}

function triggerColorInput(event) {
  const fakeColorInput = event.target;
  const colorInput = fakeColorInput.nextElementSibling;

  colorInput.click();
  colorInput.addEventListener("change", () => {
    fakeColorInput.style.backgroundColor = colorInput.value;
  });
}

function applyDefaultColorValue() {
  const colorInputs = document.getElementsByName("new-color");

  colorInputs.forEach((input) => {
    const fakeColorInput = input.previousElementSibling;

    fakeColorInput.style.backgroundColor = "#000000";
    input.value = "#000000";
  });
}

function showPersonalizedThemePreview() {
  modalOverlay.classList.add("invisible");

  const colorInputs = document.getElementsByName("new-color");
  const cssVariables = [
    "--calc-background",
    "--input-text",
    "--input-background",
    "--p-text",
    "--button-text",
    "--button-background",
    "--mode-button-text",
    "--mode-button-background",
    "--colorized-button-background",
    "--header-line",
    "--button-background-effect",
    "--button-border",
  ];

  colorInputs.forEach((input, index) => {
    document.body.style.setProperty(cssVariables[index], input.value);
  });

  document.body.addEventListener(
    "mouseup",
    stopShowingPersonalizedThemePreview
  );
}

function stopShowingPersonalizedThemePreview() {
  modalOverlay.classList.remove("invisible");
  document.body.removeEventListener(
    "mouseup",
    stopShowingPersonalizedThemePreview
  );

  const userTheme = localStorage.getItem("devcalc-userDefaultTheme");
  document.body.removeAttribute("style");

  if (userTheme !== "" || userTheme != "dark-theme") {
    document.body.setAttribute("style", userTheme);
  }
}

function createPersonalizedTheme() {
  const colorInputs = document.getElementsByName("new-color");
  const cssVariables = [
    "--calc-background",
    "--input-text",
    "--input-background",
    "--p-text",
    "--button-text",
    "--button-background",
    "--mode-button-text",
    "--mode-button-background",
    "--colorized-button-background",
    "--header-line",
    "--button-background-effect",
    "--button-border",
  ];
  const isValidTheme = handleValidThemes(colorInputs);

  if (isValidTheme) {
    colorInputs.forEach((input, index) => {
      document.body.style.setProperty(cssVariables[index], input.value);
    });

    const themeIcon = document.querySelector("#theme-icon");
    themeIcon.setAttribute("class", "fas fa-user-circle");
    handleCurrentInputColor();
    applyDefaultColorValue();

    localStorage.setItem(
      "devcalc-userCustomTheme",
      document.body.getAttribute("style")
    );
  }
}

function handleValidThemes(colorInputs) {
  let isValidTheme = false;
  let firstColor;

  colorInputs.forEach((input, index) => {
    if (index === 0) {
      firstColor = input.value;
    } else if (firstColor !== input.value) {
      isValidTheme = true;
    }
  });

  return isValidTheme;
}

function toggleTheme() {
  applyNewStylingClasses();
  let currentTheme = "";

  if (document.body.getAttribute("style")) {
    document.body.removeAttribute("style");
  } else {
    document.body.classList.toggle("dark-theme");

    if (
      document.body.classList.value == "" &&
      localStorage.getItem("devcalc-userCustomTheme")
    ) {
      currentTheme = localStorage.getItem("devcalc-userCustomTheme");
      document.body.style = currentTheme;
    } else {
      currentTheme = document.body.classList.value;
    }
  }

  localStorage.setItem("devcalc-userDefaultTheme", currentTheme);
  toggleThemeIcon(currentTheme);
  handleCurrentInputColor();
}

function toggleThemeIcon(theme) {
  const themeIcon = document.querySelector("#theme-icon");
  const iconClass =
    theme == "dark-theme"
      ? "fas fa-sun"
      : theme == ""
      ? "fas fa-moon"
      : "fas fa-user-circle";

  themeIcon.setAttribute("class", iconClass);
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
  const calcHeader = document.querySelector("main header");
  const actionsContainer = document.querySelector(
    ".expression-actions-container"
  );
  const topContainer = document.querySelector(".dev-mode-top-container");
  const sideContainer = document.querySelector(".dev-mode-side-container");

  if (actionsContainer.classList.value.includes("invisible")) {
    conversionMode.textContent = "BIN";
  }

  calcHeader.classList.toggle("space-between");
  topContainer.classList.toggle("invisible");
  actionsContainer.classList.toggle("invisible");
  actionsContainer.classList.toggle("space-between");
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
      lastNumber == "√(" ||
      lastNumber == "√"
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

    if (
      !expression.includes(",") &&
      currentNumber &&
      !isNaN(Number(currentNumber))
    ) {
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
    (lastChar == "!" && (inputChar == ")" || inputChar == "!"))
  ) {
    const penultimateChar = expression[expression.length - 2];

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
      (lastChar == "π" && (inputChar == "π" || inputChar == "e")) ||
      (lastChar == "e" && (inputChar == "e" || inputChar == "π"))
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

    if (penultimateChar == "!" && lastChar == "!" && inputChar == "!") {
      return;
    }

    expressionInput.value += inputChar;
  }

  if (expressionInput.value) {
    if (!haveSeparateCalculations) {
      haveSeparateCalculations = true;
    }

    if (inputChar == "!" || inputChar == "π" || inputChar == "e") {
      handleCalculationResult(false);
    }

    currentNumber = "";
    handleFontSize(expression);
  }
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
  expressionOperators = [];

  if (!isNotCalculable) {
    if (expressionInput.value && expressionResult.textContent) {
      handleAddingOperationsOnHistory();
    }

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
    localStorage.setItem("devcalc-history", JSON.stringify(operations));
  }

  let operationInfo = createOperationInfo(operationData);

  if (
    index === 0 ||
    operations.length === 1 ||
    (index === null &&
      operations[operations.length - 2].operationDate !==
        operationData.operationDate) ||
    (index &&
      document.querySelector("div.history-modal-content div:last-of-type h3")
        .textContent != operationData.operationDate)
  ) {
    createContentElements(operationData, operationInfo);
    return;
  }

  const operationsInfo = document.querySelector(
    "div.history-modal-content div:last-of-type div.operations-info"
  );
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

function createContentElements(operationData, operationInfo) {
  const contentContainer = document.createElement("div");

  const operationsDate = document.createElement("h3");
  operationsDate.textContent = operationData.operationDate;

  const operationsInfo = document.createElement("div");
  operationsInfo.classList.add("operations-info");

  operationsInfo.appendChild(operationInfo);
  contentContainer.appendChild(operationsDate);
  contentContainer.appendChild(operationsInfo);
  historyModalContent.appendChild(contentContainer);
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
        expression.indexOf("Hex(") === -1 &&
        expression.indexOf("Fib(") === -1
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
    result = Number(result).toLocaleString("pt-BR");
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

    if (
      expression.indexOf("(") === -1 &&
      expression.indexOf("!") === -1 &&
      expression.indexOf("√") === -1
    ) {
      haveSeparateCalculations = false;
    }

    const lastChar = expression[expression.length - 1];

    getNewCurrentNumberValue(expression);
    formatNumbers(expression);
    handleValidExpressions(expression, lastChar);
    handleFontSize(expression);
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

    if (expressionPartContent.indexOf("(") !== -1) {
      expressionPartContent = handleSeparateCalculations(expressionPartContent);
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

          newExpression = newExpression.replace(
            partOfExpression,
            conversionResult
          );
        } else {
          const result = calculateMathFunctions(
            currentMode,
            expressionPartContent
          );

          newExpression = newExpression.replace(partOfExpression, result);
        }
      } else {
        newExpression = newExpression.replace(
          partOfExpression,
          expressionPartContent
        );
      }
    } else {
      const numbersArray = getNumbersArray(expressionPartContent, operators);
      let result;

      for (let number in numbersArray) {
        result = calculateResult(numbersArray, number, operators, result);
      }

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

      newExpression = newExpression.replace(partOfExpression, result);
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
  let newExpression = expression;

  while (
    newExpression.indexOf("√") !== -1 ||
    newExpression.indexOf("!") !== -1
  ) {
    if (newExpression.indexOf("√") !== -1) {
      const firstSquareRootIndex = newExpression.indexOf("√");
      const nextIndex = firstSquareRootIndex + 1;

      let lastSquareRootIndex = firstSquareRootIndex;
      let matchString = "√";
      let squareRootNumber = "";
      let squareRootCount = 1;

      if (newExpression[nextIndex] == "√") {
        for (
          let index = firstSquareRootIndex + 1;
          index < newExpression.length;
          index++
        ) {
          if (!isNaN(newExpression[index])) {
            break;
          }

          matchString += "√";
          lastSquareRootIndex++;
          squareRootCount++;
        }
      }

      for (
        let index = lastSquareRootIndex + 1;
        index < newExpression.length;
        index++
      ) {
        if (!isNaN(Number(newExpression[index]))) {
          squareRootNumber += newExpression[index];
          continue;
        }

        break;
      }

      let result;

      for (let index = squareRootCount; index > 0; index--) {
        if (result) {
          result = Math.sqrt(result);
          continue;
        }

        result = Math.sqrt(squareRootNumber);
      }

      matchString += squareRootNumber;
      newExpression = newExpression.replace(matchString, result);
    }

    if (newExpression.indexOf("!") !== -1) {
      const exclamationIndex = newExpression.indexOf("!");
      const nextIndex = exclamationIndex + 1;
      let decreaseValue = 1;
      let matchString = "!";

      if (newExpression[nextIndex] == "!") {
        matchString += "!";
        decreaseValue = 2;
      }

      let factorialNumber = "";

      for (let index = exclamationIndex - 1; index >= 0; index--) {
        if (!isNaN(Number(newExpression[index]))) {
          factorialNumber += newExpression[index];
          continue;
        }

        break;
      }

      factorialNumber = [...factorialNumber].reverse().join("");
      let result = Number(factorialNumber);

      for (
        let index = factorialNumber - decreaseValue;
        index >= 1;
        index -= decreaseValue
      ) {
        result *= index;
      }

      matchString = factorialNumber + matchString;
      newExpression = newExpression.replace(matchString, result);
    }
  }

  return newExpression;
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
