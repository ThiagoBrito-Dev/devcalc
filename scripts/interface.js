import AppCore from "./core.js";

const appCore = new AppCore();

export default function AppInterface() {
  this.conversionMode = document.getElementById("conversion-mode");
  this.optionsBox = document.getElementById("options-box");
  this.resultContainer = document.getElementById("result-container");

  this.modalOverlay = document.querySelector("div.modal-overlay");
  this.modal = document.querySelector("div.modal-overlay section");
  this.modalTitle = document.getElementById("modal-title");
  this.historyModalContent = document.querySelector(
    "div.history-modal-content"
  );
  this.shortcutsModalContent = document.querySelector(
    "div.shortcuts-modal-content"
  );
  this.personalizationModalContent = document.querySelector(
    "div.personalization-modal-content"
  );

  this.cssVariables = [
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
  this.isDevModeActivated = false;
  this.hasExpressionInvalidMessage = false;
  this.operations;
}

AppInterface.prototype.initialize = function () {
  this.operations = JSON.parse(localStorage.getItem("devcalc-history")) || [];

  if (this.operations.length) {
    this.operations.forEach((operation, index) => {
      this.handleAddingOperationsOnHistory(operation, index);
    });
  }

  let userTheme = localStorage.getItem("devcalc-userDefaultTheme") || "";
  const attributeName =
    userTheme !== "" && userTheme != "dark-theme" ? "style" : "class";

  document.body.setAttribute(attributeName, userTheme);
  changeThemeIcon(userTheme);
  this.handleCurrentInputColor();
};

AppInterface.prototype.handleKeyboardShortcuts = function ({ altKey, key }) {
  if (key !== " " && (key == "," || !isNaN(Number(key)))) {
    this.handleInputData(key);
  } else {
    let operator;

    if (
      key == "+" ||
      key == "-" ||
      key == "*" ||
      key == "/" ||
      key == "^" ||
      key == "%"
    ) {
      operator = key.replace("^", "**");
    }

    if (operator) {
      addOperatorsOnDisplay(operator);
    } else {
      switch (key) {
        case "o":
          this.handleOptionsBoxState();
          break;
        case "a":
          if (
            this.shortcutsModalContent.classList.value.includes("invisible")
          ) {
            this.handleAccessingShortcutsModal();
          } else {
            this.handleModalState();
          }

          break;
        case "AltGraph":
          this.toggleDevMode();
          break;
        case "Backspace":
          this.deleteLastCharacter();
          break;
        case "Enter":
          this.focalizeResult();
          break;
      }
    }

    if (altKey) {
      switch (key) {
        case "t":
          this.changeTheme();
          break;
        case "l":
          this.handleDisplayCleaning();
          break;
        case "h":
          if (this.historyModalContent.classList.value.includes("invisible")) {
            this.handleAccessingHistoryModal();
          } else {
            this.handleModalState();
          }

          break;
        case "p":
          if (
            this.personalizationModalContent.classList.value.includes(
              "invisible"
            )
          ) {
            this.handleAccessingPersonalizationModal();
          } else {
            this.handleModalState();
          }

          break;
      }

      if (this.isDevModeActivated) {
        switch (key) {
          case "c":
            this.changeNumberBaseConversion();
            break;
        }
      }
    }

    if (this.isDevModeActivated && !altKey) {
      switch (key) {
        case "r":
          this.toggleResultMode();
          break;
        case "i":
          this.handleAddingNumberBaseConversionOnInput();
          break;
        case "(":
          this.handleInputData("(");
          break;
        case ")":
          this.handleInputData(")");
          break;
        case "s":
          this.handleInputData("Sin(");
          break;
        case "c":
          this.handleInputData("Cos(");
          break;
        case "t":
          this.handleInputData("Tan(");
          break;
        case "h":
          this.handleInputData("Hypot(");
          break;
        case "!":
          this.handleInputData("!");
          break;
        case ";":
          this.handleInputData("√");
          break;
        case "l":
          this.handleInputData("Log(");
          break;
        case "n":
          this.handleInputData("Ln(");
          break;
        case "f":
          this.handleInputData("Fib(");
          break;
        case "p":
          this.handleInputData("π");
          break;
        case "e":
          this.handleInputData("e");
          break;
      }
    }
  }
};

AppInterface.prototype.toggleResultMode = function () {
  const expression = appCore.expressionInput.value;
  const resultMode = document.querySelector("#result-mode");

  const currentResultMode = resultMode.textContent;
  resultMode.textContent = currentResultMode.includes("RAD") ? "GRAU" : "RAD";

  if (
    expression.indexOf("Sin(") !== -1 ||
    expression.indexOf("Cos(") !== -1 ||
    expression.indexOf("Tan(") !== -1
  ) {
    appCore.handleCalculationResult(expression);
  }
};

AppInterface.prototype.changeNumberBaseConversion = function () {
  const modes = ["BIN", "OCT", "HEX"];
  const currentMode = this.conversionMode.textContent.trim();

  modes.forEach((mode, index) => {
    if (mode === currentMode) {
      this.conversionMode.textContent = modes[++index];

      if (this.conversionMode.textContent === "") {
        this.conversionMode.textContent = modes[0];
      }
    }
  });
};

AppInterface.prototype.handleAddingNumberBaseConversionOnInput = function () {
  let currentMode = [...this.conversionMode.textContent.trim().toLowerCase()];
  currentMode[0] = currentMode[0].toUpperCase();
  currentMode = currentMode.join("");

  this.handleInputData(`${currentMode}(`);
};

AppInterface.prototype.changeTheme = function () {
  this.applyNewStylingClasses();
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
  changeThemeIcon(currentTheme);
  this.handleCurrentInputColor();
};

function changeThemeIcon(theme) {
  const themeIcon = document.querySelector("#theme-icon");
  const iconClass =
    theme == "dark-theme"
      ? "fas fa-sun"
      : theme == ""
      ? "fas fa-moon"
      : "fas fa-user-circle";

  themeIcon.setAttribute("class", iconClass);
}

AppInterface.prototype.handleOptionsBoxState = function () {
  if (this.optionsBox.classList.value.includes("invisible")) {
    this.optionsBox.classList.remove("invisible");
    setTimeout(() => {
      document.body.onclick = () => this.handleOptionsBoxState();
    }, 50);
  } else {
    this.optionsBox.classList.add("invisible");
    document.body.onclick = null;
  }
};

AppInterface.prototype.handleDisplayCleaning = function () {
  this.hasExpressionInvalidMessage = false;
  appCore.isNotCalculable = false;
  appCore.haveSeparateCalculations = false;
  appCore.expressionInput.value = "";
  appCore.expressionResult.textContent = "";
  appCore.currentNumber = "";
  appCore.firstCurrentNumberPosition = "";
  appCore.expressionOperators = [];

  this.setDefaultStylingClasses();
  this.handleFontSize();
};

AppInterface.prototype.deleteLastCharacter = function () {
  if (appCore.expressionInput.value) {
    let expression = appCore.expressionInput.value;
    let expressionArray = [...expression];
    const lastChar = expressionArray[expressionArray.length - 1]
      .replace("x", "*")
      .replace("^", "**")
      .replace("÷", "/");

    expressionArray.pop();
    expression = expressionArray.join("");
    appCore.expressionInput.value = expression;

    if (!this.hasExpressionInvalidMessage) {
      const { openingCount, closingCount } =
        appCore.countParentheses(expression);
      const currentOperator =
        appCore.expressionOperators[appCore.expressionOperators.length - 1];
      let currentNumberUpdateNeeded = true;

      if (openingCount === closingCount && lastChar == currentOperator) {
        appCore.expressionOperators.pop();
      }

      if (isNaN(Number(lastChar))) {
        currentNumberUpdateNeeded = false;
      }

      if (
        expression.indexOf("(") === -1 &&
        expression.indexOf("!") === -1 &&
        expression.indexOf("√") === -1 &&
        expression.indexOf("π") === -1 &&
        expression.indexOf("e") === -1 &&
        appCore.haveSeparateCalculations
      ) {
        appCore.haveSeparateCalculations = false;
      }

      if (currentNumberUpdateNeeded) {
        appCore.updateCurrentNumberValue(expression);
      }

      expression = expression
        .replace(/\^/g, "**")
        .replace(/\x/g, "*")
        .replace(/\÷/g, "/")
        .replace(/\./g, "")
        .replace(/\,/g, ".");

      if (expression.includes("He")) {
        expression = expression.replace("*", "x");
      }

      appCore.formatNumbers(expression);
      appCore.handleExpressions(expression);
      this.handleFontSize();
    }
  } else {
    this.hasExpressionInvalidMessage = false;
  }
};

AppInterface.prototype.toggleDevMode = function () {
  this.isDevModeActivated = !this.isDevModeActivated;

  const calcHeader = document.querySelector("main header");
  const actionsContainer = document.querySelector(
    ".expression-actions-container"
  );
  const topContainer = document.querySelector(".top-container");
  const sideContainer = document.querySelector(".side-container");

  if (actionsContainer.classList.value.includes("invisible")) {
    this.conversionMode.textContent = "BIN";
  }

  calcHeader.classList.toggle("space-between");
  topContainer.classList.toggle("invisible");
  actionsContainer.classList.toggle("invisible");
  actionsContainer.classList.toggle("space-between");
  appCore.expressionInput.classList.toggle("stretch");
  appCore.expressionResult.classList.toggle("stretch");
  sideContainer.classList.toggle("invisible");

  appCore.expressionInput.classList.remove("has-transition");
  this.handleFontSize();
};

AppInterface.prototype.handleInputData = function (char) {
  let expression = appCore.expressionInput.value
    .replace(/\^/g, "**")
    .replace(/\x/g, "*")
    .replace(/\÷/g, "/")
    .replace(/\./g, "")
    .replace(/\,/g, ".");

  if (expression.includes("He")) {
    expression = expression.replace("*", "x");
  }

  if (
    this.hasExpressionInvalidMessage &&
    !char.includes("*") &&
    char != "+" &&
    char != "/" &&
    char != "%"
  ) {
    this.hasExpressionInvalidMessage = false;
    appCore.isNotCalculable = false;
    appCore.expressionInput.value = "";
    expression = "";
  }

  if (char == "," || !isNaN(Number(char))) {
    const isValid = appCore.validateNumbersInsertion(expression, char);

    if (isValid) {
      let canAddCurrentChar = true;

      if (char == ",") {
        canAddCurrentChar = appCore.checkIfCommaCanBeAdded(expression, char);
      }

      canAddCurrentChar && addNumbersOnDisplay(expression, char);
    }
  } else if (
    char.includes("*") ||
    char == "+" ||
    char == "-" ||
    char == "/" ||
    char == "%"
  ) {
    const expression = appCore.expressionInput.value;
    const lastChar = expression[expression.length - 1];
    const isValid = appCore.validateOperatorsInsertion(
      expression,
      lastChar,
      char
    );

    if (isValid) {
      addOperatorsOnDisplay(expression, lastChar, char);
      appCore.currentNumber = "";
    }
  } else if (isNaN(Number(char))) {
    const lastChar = expression[expression.length - 1];
    const isValid = appCore.validateCharactersInsertion(
      expression,
      lastChar,
      char
    );

    isValid && addCharactersOnDisplay(expression, lastChar, char);
  }

  const newExpression = appCore.expressionInput.value
    .replace("^", "**")
    .replace("x", "*")
    .replace("÷", "/")
    .replace(/\./g, "")
    .replace(/\,/g, ".");

  if (expression !== newExpression) {
    this.handleFontSize();
  }
};

function addNumbersOnDisplay(expression, number) {
  appCore.expressionInput.value += number;
  number = number.replace(",", ".");
  expression += number;

  appCore.formatNumbers(expression, number);
  appCore.handleExpressions(expression);
}

AppInterface.prototype.addFormattedNumbersOnDisplay = function (
  formattedNumber
) {
  const expressionArray = [...appCore.expressionInput.value];
  const lastNumber = expressionArray
    .join("")
    .slice(appCore.firstCurrentNumberPosition);
  const lastPosition = lastNumber.includes(".")
    ? formattedNumber.length + 1
    : formattedNumber.length;

  expressionArray.splice(
    appCore.firstCurrentNumberPosition,
    lastPosition,
    formattedNumber
  );

  appCore.expressionInput.value = expressionArray.join("");
};

function addOperatorsOnDisplay(expression, lastChar, operator) {
  if (!expression || lastChar == "(") {
    appCore.expressionInput.value += operator;
  } else if (
    expression.length > 1 ||
    !isNaN(Number(lastChar)) ||
    lastChar == "π" ||
    lastChar == "e"
  ) {
    const { openingCount, closingCount } = appCore.countParentheses(expression);
    let expressionArray = [...expression];
    operator = appCore.handleSignRules(lastChar, expressionArray, operator);

    if (openingCount === closingCount) {
      appCore.expressionOperators.push(operator);
    }

    expression = expressionArray.join("");
    expression += operator
      .replace("**", "^")
      .replace("*", "x")
      .replace("/", "÷");

    appCore.expressionInput.value = expression;
  }
}

function addCharactersOnDisplay(expression, lastChar, inputChar) {
  appCore.expressionInput.value += inputChar;
  expression += inputChar;

  if (expression) {
    if (!appCore.haveSeparateCalculations) {
      appCore.haveSeparateCalculations = true;
    }

    if (
      expression.indexOf("!") !== -1 ||
      (((lastChar &&
        isNaN(Number(lastChar)) &&
        lastChar.replace(/[aA-zZ]/g, "")) ||
        !lastChar) &&
        (inputChar == "π" || inputChar == "e"))
    ) {
      appCore.handleExpressions(expression);
    }
  }
}

AppInterface.prototype.handleFontSize = function () {
  const expression = appCore.expressionInput.value;
  const fontSize = appCore.expressionInput.style.fontSize;
  const breakpoint = this.isDevModeActivated ? 25 : 18;

  if (expression.length >= breakpoint && fontSize != "16.5px") {
    appCore.expressionInput.style.fontSize = "16.5px";
  } else if (
    expression.length < breakpoint &&
    fontSize != "20px" &&
    fontSize != ""
  ) {
    appCore.expressionInput.style.fontSize = "20px";
  }
};

AppInterface.prototype.showResult = function (result) {
  this.applyNewStylingClasses(result);
  appCore.expressionResult.textContent = result;
};

AppInterface.prototype.applyNewStylingClasses = function (result = "") {
  appCore.expressionInput.classList.add("has-transition");
  this.resultContainer.classList.add("has-transition");
  appCore.expressionResult.classList.add("has-transition");

  if (result) {
    appCore.expressionInput.classList.add("has-result");

    appCore.expressionInput.classList.remove("has-transition");
    this.resultContainer.classList.remove("invisible", "has-transition");
    appCore.expressionResult.classList.remove("has-transition");
  }
};

AppInterface.prototype.focalizeResult = function () {
  const expression = appCore.expressionInput.value;
  const lastChar = expression[expression.length - 1];
  const { openingCount, closingCount } = appCore.countParentheses(expression);

  if (
    openingCount === closingCount &&
    (!isNaN(Number(lastChar)) ||
      lastChar == ")" ||
      lastChar == "!" ||
      lastChar == "π" ||
      lastChar == "e")
  ) {
    appCore.expressionOperators = [];

    if (!appCore.isNotCalculable) {
      if (expression && appCore.expressionResult.textContent) {
        this.handleAddingOperationsOnHistory();
      }

      this.setDefaultStylingClasses();
      appCore.expressionInput.value = appCore.expressionResult.textContent;
      appCore.expressionResult.textContent = "";
      appCore.currentNumber = expression;
    } else {
      appCore.expressionInput.value = "Expressão inválida";
      appCore.currentNumber = "";
      this.hasExpressionInvalidMessage = true;
    }

    appCore.firstCurrentNumberPosition = 0;
  } else {
    alert(
      "Desculpe, mas, para que o resultado seja ampliado, a expressão deve ser finalizada!"
    );
  }
};

AppInterface.prototype.setDefaultStylingClasses = function () {
  this.resultContainer.classList.add("invisible");
  appCore.expressionInput.classList.remove("has-result", "has-transition");
  this.resultContainer.classList.remove("has-transition");
  appCore.expressionResult.classList.remove("has-transition");
};

AppInterface.prototype.clearModal = function () {
  this.modal.classList.value = "";
  this.modalTitle.textContent = "";
  this.historyModalContent.classList.add("invisible");
  this.shortcutsModalContent.classList.add("invisible");
  this.personalizationModalContent.classList.add("invisible");
};

AppInterface.prototype.handleModalState = function () {
  if (!this.modalOverlay.classList.value.includes("invisible")) {
    this.clearModal();
  }

  this.modalOverlay.classList.toggle("invisible");
};

AppInterface.prototype.handleModalVisibilityConflicts = function () {
  !this.modalOverlay.classList.value.includes("invisible")
    ? this.clearModal()
    : this.handleModalState();

  if (!this.optionsBox.classList.value.includes("invisible")) {
    this.handleOptionsBoxState();
  }
};

AppInterface.prototype.handleAccessingHistoryModal = function () {
  this.handleModalVisibilityConflicts();
  this.modal.classList.add("history-modal");
  this.modalTitle.textContent = "Histórico";
  this.historyModalContent.classList.remove("invisible");
};

AppInterface.prototype.handleAddingOperationsOnHistory = function (
  operationData = null,
  index = null
) {
  if (!operationData) {
    const dateFormatter = Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "long",
    });

    operationData = {
      operationDate: dateFormatter.format(Date.now()),
      expression: appCore.expressionInput.value,
      result: appCore.expressionResult.textContent,
    };

    this.operations.push(operationData);
    localStorage.setItem("devcalc-history", JSON.stringify(this.operations));
  }

  let operationInfo = createOperationInfo(operationData);

  if (
    index === 0 ||
    this.operations.length === 1 ||
    (index === null &&
      this.operations[this.operations.length - 2].operationDate !==
        operationData.operationDate) ||
    (index &&
      document.querySelector("div.history-modal-content div:last-of-type h3")
        .textContent != operationData.operationDate)
  ) {
    this.createContentElements(operationData, operationInfo);
    return;
  }

  const operationsInfo = document.querySelector(
    "div.history-modal-content div:last-of-type div.operations-info"
  );
  operationsInfo.appendChild(operationInfo);
};

AppInterface.prototype.createContentElements = function (
  operationData,
  operationInfo
) {
  const contentContainer = document.createElement("div");

  const operationsDate = document.createElement("h3");
  operationsDate.textContent = operationData.operationDate;

  const operationsInfo = document.createElement("div");
  operationsInfo.classList.add("operations-info");

  operationsInfo.appendChild(operationInfo);
  contentContainer.appendChild(operationsDate);
  contentContainer.appendChild(operationsInfo);
  this.historyModalContent.appendChild(contentContainer);
};

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

AppInterface.prototype.handleAccessingShortcutsModal = function () {
  this.handleModalVisibilityConflicts();
  this.modal.classList.add("shortcuts-modal");
  this.modalTitle.textContent = "Atalhos do Teclado";
  this.shortcutsModalContent.classList.remove("invisible");
};

AppInterface.prototype.handleAccessingPersonalizationModal = function () {
  this.handleModalVisibilityConflicts();
  this.modal.classList.add("personalization-modal");
  this.modalTitle.textContent = "Personalização";
  this.personalizationModalContent.classList.remove("invisible");
};

AppInterface.prototype.handleCurrentInputColor = function () {
  const bodyTheme = document.body.classList.value.includes("dark-theme")
    ? ".dark-theme"
    : "body";

  this.cssVariables.forEach((variable, index) => {
    const currentColor = getComputedStyle(
      document.querySelector(bodyTheme)
    ).getPropertyValue(variable);
    const currentColorTableData = document.querySelector(
      `tbody tr:nth-child(${index + 1}) td.current-color-data`
    );

    const currentColorInput = document.createElement("input");
    currentColorInput.setAttribute("type", "text");
    currentColorInput.setAttribute("readonly", "true");
    currentColorInput.classList.add("current-color", "has-transition");
    currentColorInput.style.backgroundColor = currentColor;

    currentColorInput.addEventListener(
      "dblclick",
      copyCurrentColorValueToNewColorValue
    );

    currentColorTableData.childNodes.length
      ? currentColorTableData.replaceChild(
          currentColorInput,
          currentColorTableData.querySelector("input.current-color")
        )
      : currentColorTableData.appendChild(currentColorInput);
  });
};

function copyCurrentColorValueToNewColorValue({ target }) {
  const currentColorInput = target;
  const unformattedCurrentColor = currentColorInput.style.backgroundColor;
  const splittedCurrentColor = unformattedCurrentColor
    .replace(/[^0-9\,]/g, "")
    .split(",");
  let formattedCurrentColor = "#";

  splittedCurrentColor.forEach((colorChannelValue) => {
    let convertedColorChannelValue = appCore.calculateNumberBaseConversions(
      "Hex",
      colorChannelValue
    );

    if (convertedColorChannelValue.length === 1) {
      convertedColorChannelValue = "0" + convertedColorChannelValue;
    }

    formattedCurrentColor += convertedColorChannelValue;
  });

  const targetParentSibling =
    currentColorInput.parentElement.nextElementSibling;
  const fakeNewColorInput =
    targetParentSibling.querySelector("input[type='text']");
  const newColorInput = targetParentSibling.querySelector(
    "input[type='color']"
  );

  fakeNewColorInput.style.backgroundColor = formattedCurrentColor;
  newColorInput.value = formattedCurrentColor;
}

AppInterface.prototype.triggerColorInput = function ({ target }) {
  const fakeColorInput = target;
  const colorInput = fakeColorInput.nextElementSibling;

  colorInput.click();
  colorInput.addEventListener("change", () => {
    fakeColorInput.style.backgroundColor = colorInput.value;
  });
};

AppInterface.prototype.applyDefaultColorValue = function () {
  const colorInputs = document.getElementsByName("new-color");

  colorInputs.forEach((input) => {
    const fakeColorInput = input.previousElementSibling;

    fakeColorInput.style.backgroundColor = "#000000";
    input.value = "#000000";
  });
};

AppInterface.prototype.showPersonalizedThemePreview = function () {
  this.modalOverlay.classList.add("invisible");

  const colorInputs = document.getElementsByName("new-color");

  colorInputs.forEach((input, index) => {
    document.body.style.setProperty(this.cssVariables[index], input.value);
  });

  document.body.onmouseup = () => this.stopShowingPersonalizedThemePreview();
};

AppInterface.prototype.stopShowingPersonalizedThemePreview = function () {
  this.modalOverlay.classList.remove("invisible");
  document.body.onmouseup = null;

  const userTheme = localStorage.getItem("devcalc-userDefaultTheme");
  document.body.removeAttribute("style");

  if (userTheme !== "" || userTheme != "dark-theme") {
    document.body.setAttribute("style", userTheme);
  }
};

AppInterface.prototype.createPersonalizedTheme = function () {
  const colorInputs = document.getElementsByName("new-color");
  const isValidTheme = appCore.validateThemes(colorInputs);

  if (isValidTheme) {
    colorInputs.forEach((input, index) => {
      document.body.style.setProperty(this.cssVariables[index], input.value);
    });

    const currentTheme = document.body.getAttribute("style");

    localStorage.setItem("devcalc-userCustomTheme", currentTheme);
    localStorage.setItem("devcalc-userDefaultTheme", currentTheme);

    changeThemeIcon(currentTheme);
    this.handleCurrentInputColor();
    this.applyDefaultColorValue();
  }
};
