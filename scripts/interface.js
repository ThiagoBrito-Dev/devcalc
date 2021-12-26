import AppCore from "./core.js";

const appCore = new AppCore();

export default function AppInterface() {
  this.conversionType = document.getElementById("conversion-type");
  this.optionsBox = document.getElementById("options-box");
  this.resultContainer = document.getElementById("result-container");

  this.modalOverlay = document.getElementById("modal-overlay");
  this.modal = document.querySelector("div#modal-overlay section");
  this.modalTitle = document.getElementById("modal-title");
  this.historyModalContent = document.getElementById("history-modal-content");
  this.shortcutsModalContent = document.getElementById(
    "shortcuts-modal-content"
  );
  this.personalizationModalContent = document.getElementById(
    "personalization-modal-content"
  );

  this.cssVariables = [
    "--calc-background", // primary
    "--input-text", // primary
    "--input-background", // primary
    "--p-text", // primary
    "--button-text", // primary
    "--button-background", // primary
    "--mode-button-text", // secondary
    "--mode-button-background", // secondary
    "--colorized-button-background", // secondary
    "--history-date", // secondary
    "--header-line", // tertiary
    "--history-dashed-line", // tertiary
    "--button-background-effect", // tertiary
    "--button-border", // tertiary
  ];
  this.lastFocusedElements = [];
  this.isDevModeActivated = false;
  this.hasExpressionInvalidMessage = false;
  this.resultCantBeContinued = false;
  this.operations;
}

AppInterface.prototype.initialize = function () {
  this.operations = JSON.parse(localStorage.getItem("devcalc-history")) || [];

  if (this.operations.length) {
    this.operations.forEach((operation, index) => {
      this.handleAddingOperationsOnHistory(operation, index);
    });
  }

  const userTheme = localStorage.getItem("devcalc-userDefaultTheme") || "";
  const attributeName =
    userTheme !== "" && userTheme != "dark-theme" ? "style" : "class";
  document.documentElement.setAttribute(attributeName, userTheme);

  changeThemeIcon(userTheme);
  setNewColorInputDefaultValue();
  this.handleCurrentInputColor();
};

AppInterface.prototype.handleKeyboardShortcuts = function ({ altKey, key }) {
  if (key !== " " && (key == "," || !isNaN(Number(key)))) {
    this.handleInputData(key);
  } else {
    let operator;
    key = key.replace("^", "**");

    if (appCore.operatorsExample.indexOf(key) !== -1) {
      operator = key;
    }

    if (operator) {
      this.handleInputData(operator);
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
      }
    }

    if (altKey) {
      switch (key) {
        case "Enter":
          this.focalizeResult();
          break;
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
            this.changeNumberBaseConversionType();
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
  const expression = appCore.expressionInput.value
    .replace(/\^/g, "**")
    .replace(/\x/g, "*")
    .replace(/\÷/g, "/")
    .replace(/\./g, "")
    .replace(/\,/g, ".");

  const measurementUnit = document.getElementById("measurement-unit");
  const currentResultMode = measurementUnit.textContent;
  measurementUnit.textContent = currentResultMode.includes("RAD")
    ? "GRAU"
    : "RAD";
  appCore.isNotCalculable = false;

  if (
    expression.indexOf("Sin(") !== -1 ||
    expression.indexOf("Cos(") !== -1 ||
    expression.indexOf("Tan(") !== -1
  ) {
    appCore.handleExpressions(expression);
  }
};

AppInterface.prototype.changeNumberBaseConversionType = function () {
  const conversionTypes = ["BIN", "OCT", "HEX"];
  const currentType = this.conversionType.textContent.trim();

  conversionTypes.forEach((mode, index) => {
    if (mode === currentType) {
      this.conversionType.textContent = conversionTypes[++index];

      if (this.conversionType.textContent === "") {
        this.conversionType.textContent = conversionTypes[0];
      }
    }
  });
};

AppInterface.prototype.handleAddingNumberBaseConversionOnInput = function () {
  let currentMode = [...this.conversionType.textContent.trim().toLowerCase()];
  currentMode[0] = currentMode[0].toUpperCase();
  currentMode = currentMode.join("");

  this.handleInputData(`${currentMode}(`);
};

AppInterface.prototype.changeTheme = function () {
  this.applyNewStylingClasses();

  const htmlElement = document.documentElement;
  let currentTheme = "";

  if (htmlElement.getAttribute("style")) {
    htmlElement.removeAttribute("style");
  } else {
    htmlElement.classList.toggle("dark-theme");

    if (
      htmlElement.classList.value == "" &&
      localStorage.getItem("devcalc-userCustomTheme")
    ) {
      currentTheme = localStorage.getItem("devcalc-userCustomTheme");
      htmlElement.style = currentTheme;
    } else {
      currentTheme = htmlElement.classList.value;
    }
  }

  localStorage.setItem("devcalc-userDefaultTheme", currentTheme);
  changeThemeIcon(currentTheme);
  setNewColorInputDefaultValue();
  this.handleCurrentInputColor();
};

function changeThemeIcon(theme) {
  const themeIcon = document.getElementById("theme-icon");
  const iconClass =
    theme == "dark-theme"
      ? "fas fa-sun"
      : theme == ""
      ? "fas fa-moon"
      : "fas fa-user-circle";

  themeIcon.setAttribute("class", iconClass);
}

AppInterface.prototype.handleModalFocus = function (modal) {
  const modalParent = modal.parentElement;

  if (
    modal.classList.value.includes("invisible") ||
    modalParent.classList.value.includes("invisible")
  ) {
    if (this.lastFocusedElements.length) {
      const elementToBeFocused = this.lastFocusedElements.pop();
      elementToBeFocused.focus();
    } else {
      const changeTheme = document.getElementById("change-theme");
      const measurementUnit = document.getElementById("measurement-unit");

      this.isDevModeActivated ? measurementUnit.focus() : changeTheme.focus();
    }

    return;
  }

  document.activeElement.id !== "page" &&
    this.lastFocusedElements.push(document.activeElement);
  modal.focus();
};

function createFocusTrap(event, modal) {
  if (event.key == "Tab") {
    const focusedElement = document.activeElement;

    if (event.shiftKey) {
      if (
        focusedElement === modal ||
        focusedElement.classList.value.includes("close-modal")
      ) {
        event.preventDefault();
      }
    } else {
      const modalContent = modal.querySelector(
        "div#modal-overlay > section > div:not(.invisible)"
      );

      if (
        focusedElement.id == "open-personalization" ||
        (modalContent?.id == "history-modal-content" &&
          focusedElement.classList.value.includes("close-modal")) ||
        (focusedElement.classList.value.includes("card") &&
          !focusedElement.nextElementSibling) ||
        focusedElement.id == "save-theme"
      ) {
        event.preventDefault();
      }
    }
  }
}

AppInterface.prototype.handleOptionsBoxState = function (event = null) {
  if (this.optionsBox.classList.value.includes("invisible")) {
    this.optionsBox.classList.remove("invisible");
    this.handleModalFocus(this.optionsBox);

    setTimeout(() => {
      document.body.onclick = (event) => this.handleOptionsBoxState(event);
    }, 50);
    document.body.onkeydown = (event) => {
      this.handleKeyboardShortcuts(event);
      createFocusTrap(event, this.optionsBox);
    };
  } else if (this.modalOverlay.classList.value.includes("invisible")) {
    if (event?.target.parentElement.id == "modal-header") {
      return;
    }

    this.optionsBox.classList.add("invisible");
    this.handleModalFocus(this.optionsBox);

    document.body.onclick = null;
    document.body.onkeydown = (event) => {
      this.handleKeyboardShortcuts(event);
    };
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

  const calcHeader = document.getElementById("calc-header");
  const actionsContainer = document.getElementById(
    "expression-actions-container"
  );
  const headerContainer = document.getElementById("header-container");
  const mainContainerLastElements = document.querySelectorAll(
    "div#main-container div div"
  );

  if (actionsContainer.classList.value.includes("invisible")) {
    this.conversionType.textContent = "BIN";
  }

  calcHeader.classList.toggle("space-between");
  headerContainer.classList.toggle("invisible");
  actionsContainer.classList.toggle("invisible");
  appCore.expressionInput.classList.toggle("stretch");
  appCore.expressionResult.classList.toggle("stretch");
  this.resultContainer.classList.toggle("stretch");

  mainContainerLastElements.forEach((element) => {
    element.classList.toggle("invisible");
  });

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
    char != "!" &&
    char != "," &&
    char != ")" &&
    (appCore.operatorsExample.indexOf(char) === -1 || char == "-")
  ) {
    if (this.hasExpressionInvalidMessage) {
      this.hasExpressionInvalidMessage = false;
      appCore.isNotCalculable = false;
      appCore.expressionInput.value = "";
      expression = "";
    }
    if (this.resultCantBeContinued) {
      this.resultCantBeContinued = false;
      appCore.expressionInput.value = "";
      appCore.currentNumber = "";
      expression = "";
    }
  }

  if (!this.resultCantBeContinued) {
    if (char == "," || !isNaN(Number(char))) {
      const isValid = appCore.validateNumbersInsertion(expression, char);

      if (isValid) {
        let canAddCurrentChar = true;

        if (char == ",") {
          canAddCurrentChar = appCore.checkIfCommaCanBeAdded(expression, char);
        }

        canAddCurrentChar && addNumbersOnDisplay(expression, char);
      }
    } else if (appCore.operatorsExample.indexOf(char) !== -1) {
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
  let hasLeftZeros = false;

  if (lastNumber.replace(/\./g, "") !== formattedNumber.replace(/\./g, "")) {
    hasLeftZeros = true;
  }

  const lastPosition = lastNumber.includes(".")
    ? formattedNumber.length + 1
    : hasLeftZeros
    ? lastNumber.length
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

      if (
        expression.includes("Fib(") ||
        expression.includes("Bin(") ||
        expression.includes("Oct(") ||
        expression.includes("Hex(")
      ) {
        this.resultCantBeContinued = true;
      }

      this.setDefaultStylingClasses();
      appCore.expressionInput.value = appCore.expressionResult.textContent;
      appCore.expressionResult.textContent = "";
      appCore.currentNumber = appCore.expressionInput.value;
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
  this.modalOverlay.classList.toggle("invisible");
  this.handleModalFocus(this.modal);

  if (this.modalOverlay.classList.value.includes("invisible")) {
    this.clearModal();

    document.body.onkeydown = (event) => {
      this.handleKeyboardShortcuts(event);
    };

    return;
  }

  document.body.onkeydown = (event) => {
    this.handleKeyboardShortcuts(event);
    createFocusTrap(event, this.modal);
  };
};

AppInterface.prototype.handleModalVisibilityConflicts = function () {
  if (!this.modalOverlay.classList.value.includes("invisible")) {
    this.clearModal();
    this.modal.focus();
  } else {
    this.handleModalState();
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
      document.querySelector("div#history-modal-content section:last-child h3")
        .textContent != operationData.operationDate)
  ) {
    this.createContentElements(operationData, operationInfo);
    return;
  }

  const operationsInfo = document.querySelector(
    "div#history-modal-content section:last-child div.operations-info"
  );
  operationsInfo.appendChild(operationInfo);
};

AppInterface.prototype.createContentElements = function (
  operationData,
  operationInfo
) {
  const contentSection = document.createElement("section");

  const operationsDate = document.createElement("h3");
  operationsDate.textContent = operationData.operationDate;

  const operationsInfo = document.createElement("div");
  operationsInfo.classList.add("operations-info");

  operationsInfo.appendChild(operationInfo);
  contentSection.appendChild(operationsDate);
  contentSection.appendChild(operationsInfo);
  this.historyModalContent.appendChild(contentSection);
};

function createOperationInfo(operationData) {
  const operationInfo = document.createElement("div");

  const performedExpression = document.createElement("p");
  performedExpression.setAttribute("aria-label", "Expressão");
  performedExpression.textContent = operationData.expression;

  const expressionResult = document.createElement("p");
  expressionResult.setAttribute("aria-label", "Resultado");
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
  const htmlElement = document.documentElement;
  const appTheme = htmlElement.classList.value.includes("dark-theme")
    ? ".dark-theme"
    : "body";

  this.cssVariables.forEach((variable, index) => {
    const currentColor = getComputedStyle(
      document.querySelector(appTheme)
    ).getPropertyValue(variable);
    const currentColorTableData = document.querySelector(
      `tbody tr:nth-child(${index + 1}) td.current-color-data`
    );

    const currentColorInput = document.createElement("input");
    currentColorInput.setAttribute("type", "text");
    currentColorInput.setAttribute("readonly", "true");
    currentColorInput.setAttribute("aria-label", `Código: ${currentColor}`); // study the possibility of getting, through the code, the name of the color and display it to the user.
    currentColorInput.classList.add("current-color", "has-transition");
    currentColorInput.style.backgroundColor = currentColor;

    currentColorInput.ondblclick = copyCurrentColorValueToNewColorValue;
    currentColorInput.onkeyup = copyCurrentColorValueToNewColorValue;

    currentColorTableData.childNodes.length
      ? currentColorTableData.replaceChild(
          currentColorInput,
          currentColorTableData.querySelector("input.current-color")
        )
      : currentColorTableData.appendChild(currentColorInput);
  });
};

function copyCurrentColorValueToNewColorValue({ target, key, code }) {
  if (!key || key == "Enter" || code == "Space") {
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
}

AppInterface.prototype.triggerColorInput = function ({ target, key, code }) {
  if (!key || key == "Enter" || code == "Space") {
    const fakeColorInput = target;
    const colorInput = fakeColorInput.nextElementSibling;

    colorInput.click();
    colorInput.addEventListener("change", () => {
      fakeColorInput.style.backgroundColor = colorInput.value;
    });
  }
};

function setNewColorInputDefaultValue() {
  const newColorInputs = document.getElementsByName("new-color");
  const colorValue = getComputedStyle(document.documentElement)
    .getPropertyValue("--mode-button-text")
    .replace(" ", "");

  newColorInputs.forEach((input) => {
    input.value = colorValue;
  });
}

AppInterface.prototype.applyDefaultColorValue = function () {
  const newColorInputs = document.getElementsByName("new-color");
  const colorValue = getComputedStyle(document.documentElement)
    .getPropertyValue("--mode-button-text")
    .replace(" ", "");

  newColorInputs.forEach((input) => {
    const fakeNewColorInput = input.previousElementSibling;

    fakeNewColorInput.removeAttribute("style");
    input.value = colorValue;
  });
};

AppInterface.prototype.showPersonalizedThemePreview = function (
  { key },
  userIsAccessingFromMobileDevice = false
) {
  if (!key || key == "Enter") {
    const htmlElement = document.documentElement;
    this.modalOverlay.classList.add("invisible");

    const colorInputs = document.getElementsByName("new-color");

    colorInputs.forEach((input, index) => {
      htmlElement.style.setProperty(this.cssVariables[index], input.value);
    });

    if (userIsAccessingFromMobileDevice) {
      setTimeout(() => {
        document.body.onclick = () =>
          this.stopShowingPersonalizedThemePreview(
            userIsAccessingFromMobileDevice
          );
      }, 50);
    } else {
      document.body.onmouseup = () =>
        this.stopShowingPersonalizedThemePreview();
    }

    document.body.onkeyup = () => this.stopShowingPersonalizedThemePreview();
  }
};

AppInterface.prototype.stopShowingPersonalizedThemePreview = function (
  hasToAssignEventListener = false
) {
  const htmlElement = document.documentElement;
  const previewThemeButton = document.getElementById("preview-theme");

  if (hasToAssignEventListener) {
    document.body.onclick = null;
    previewThemeButton.onclick = (event) =>
      this.showPersonalizedThemePreview(event);
  } else {
    document.body.onmouseup = null;
  }
  document.body.onkeyup = null;

  this.modalOverlay.classList.remove("invisible");
  htmlElement.removeAttribute("style");

  const userTheme = localStorage.getItem("devcalc-userDefaultTheme");

  if (userTheme !== "" || userTheme != "dark-theme") {
    htmlElement.setAttribute("style", userTheme);
  }

  previewThemeButton.focus();
};

AppInterface.prototype.createPersonalizedTheme = function () {
  const htmlElement = document.documentElement;
  const colorInputs = document.getElementsByName("new-color");
  const isValidTheme = appCore.validateThemes(colorInputs);

  if (isValidTheme) {
    colorInputs.forEach((input, index) => {
      htmlElement.style.setProperty(this.cssVariables[index], input.value);
    });

    const currentTheme = htmlElement.getAttribute("style");

    localStorage.setItem("devcalc-userCustomTheme", currentTheme);
    localStorage.setItem("devcalc-userDefaultTheme", currentTheme);

    changeThemeIcon(currentTheme);
    this.handleCurrentInputColor();
    this.applyDefaultColorValue();
  }
};
