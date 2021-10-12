import AppCore from "./core.js";

const appCore = new AppCore();

export default class AppInterface {
  constructor() {
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
    this.operations;
  }

  initialize() {
    this.operations = JSON.parse(localStorage.getItem("devcalc-history")) || [];

    if (this.operations.length) {
      this.operations.forEach((operation, index) => {
        this.handleAddingOperationsOnHistory(operation, index);
      });
    }

    let userTheme = localStorage.getItem("devcalc-userDefaultTheme");
    if (userTheme === null) {
      userTheme = "";
    }

    const attributeName =
      userTheme !== "" && userTheme != "dark-theme" ? "style" : "class";

    document.body.setAttribute(attributeName, userTheme);
    this.switchThemeIcon(userTheme);
    this.handleCurrentInputColor();
  }

  handleKeyboardShortcuts({ key }) {
    if (key !== " " && (key == "," || !isNaN(Number(key)))) {
      this.addNumbersOnDisplay(appCore.expressionInput.value, key);
    } else {
      let operator;

      switch (key) {
        case "+":
          operator = key;
          break;
        case "-":
          operator = key;
          break;
        case "*":
          operator = key;
          break;
        case "^":
          operator = key;
          break;
        case "/":
          operator = key;
          break;
        case "%":
          operator = key;
          break;
      }

      if (operator) {
        this.addOperatorsOnDisplay(operator);
      } else {
        switch (key) {
          case "r":
            this.toggleResultMode();
            break;
          case "t":
            this.switchTheme();
            break;
          case "l":
            this.clearExpression();
            break;
          case "c":
            this.changeConversionMode();
            break;
          case "o":
            this.handleOptionsBox();
            break;
          case "h":
            if (
              this.historyModalContent.classList.value.includes("invisible")
            ) {
              this.handleHistoryAccess();
            }

            break;
          case "a":
            if (
              this.shortcutsModalContent.classList.value.includes("invisible")
            ) {
              this.handleShortcutsAccess();
            }

            break;
          case "p":
            if (
              this.personalizationModalContent.classList.value.includes(
                "invisible"
              )
            ) {
              this.handlePersonalizationAccess();
            }

            break;
          case "Escape":
            if (!this.modalOverlay.classList.value.includes("invisible")) {
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
    }
  }

  toggleResultMode() {
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
  }

  changeConversionMode() {
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
  }

  addConversionModeOnInput() {
    let currentMode = [...this.conversionMode.textContent.trim().toLowerCase()];
    currentMode[0] = currentMode[0].toUpperCase();
    currentMode = currentMode.join("");

    this.handleInputData(`${currentMode}(`);
  }

  switchTheme() {
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
    this.switchThemeIcon(currentTheme);
    this.handleCurrentInputColor();
  }

  switchThemeIcon(theme) {
    const themeIcon = document.querySelector("#theme-icon");
    const iconClass =
      theme == "dark-theme"
        ? "fas fa-sun"
        : theme == ""
        ? "fas fa-moon"
        : "fas fa-user-circle";

    themeIcon.setAttribute("class", iconClass);
  }

  handleOptionsBox() {
    if (this.optionsBox.classList.value.includes("invisible")) {
      this.optionsBox.classList.remove("invisible");
      setTimeout(() => {
        document.body.onclick = () => this.handleOptionsBox();
      }, 50);
    } else {
      this.optionsBox.classList.add("invisible");
      document.body.onclick = null;
    }
  }

  clearExpression() {
    appCore.expressionInput.value = "";
    appCore.expressionResult.textContent = "";
    appCore.currentNumber = "";
    appCore.firstCurrentNumberPosition = "";
    appCore.isNotCalculable = false;
    appCore.haveSeparateCalculations = false;
    appCore.expressionOperators = [];

    this.setDefaultStylingClasses();
    this.handleFontSize();
  }

  deleteLastCharacter() {
    if (appCore.expressionInput.value) {
      let expression = appCore.expressionInput.value;
      let expressionArray = [...expression];

      const lastChar = expressionArray[expressionArray.length - 1]
        .replace("x", "*")
        .replace("^", "**")
        .replace("÷", "/");
      const currentOperator =
        appCore.expressionOperators[appCore.expressionOperators.length - 1];
      let currentNumberUpdateNeeded = true;

      if (lastChar == currentOperator) {
        appCore.expressionOperators.pop();
      }

      if (isNaN(Number(lastChar))) {
        currentNumberUpdateNeeded = false;
      }

      expressionArray.pop();
      expression = expressionArray.join("");
      appCore.expressionInput.value = expression;

      if (
        expression.indexOf("(") === -1 &&
        expression.indexOf("!") === -1 &&
        expression.indexOf("√") === -1
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

      appCore.formatNumbers(expression);
      appCore.handleExpressions(expression);
      this.handleFontSize();
    }
  }

  toggleDevMode() {
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
    sideContainer.classList.toggle("invisible");

    appCore.expressionInput.classList.remove("has-transition");
    this.handleFontSize();
  }

  handleInputData(char) {
    let expression = appCore.expressionInput.value
      .replace(/\^/g, "**")
      .replace(/\x/g, "*")
      .replace(/\÷/g, "/")
      .replace(/\./g, "")
      .replace(/\,/g, ".");

    if (char == "," || !isNaN(Number(char))) {
      this.addNumbersOnDisplay(expression, char);
    } else if (
      char.includes("*") ||
      char == "+" ||
      char == "-" ||
      char == "/" ||
      char == "%"
    ) {
      this.addOperatorsOnDisplay(char);
    } else {
      this.addCharactersOnDisplay(expression, char);
    }
  }

  addNumbersOnDisplay(expression, number) {
    const lastChar = expression[expression.length - 1];

    if (
      lastChar != ")" &&
      lastChar != "!" &&
      lastChar != "π" &&
      lastChar != "e"
    ) {
      if (
        number != "," ||
        (expression.length >= 1 && !isNaN(Number(lastChar)))
      ) {
        const canBe = appCore.checkIfCommaCanBeAdded(expression, number);

        if (canBe) {
          appCore.expressionInput.value += number;

          number = number.replace(",", ".");
          expression += number;

          appCore.formatNumbers(expression, number);
          appCore.handleExpressions(expression);
        }
      }

      this.handleFontSize();
    }
  }

  addFormattedNumbersOnDisplay(formattedNumber) {
    const expressionArray = [...appCore.expressionInput.value];
    const lastPosition = formattedNumber.length + 1;

    expressionArray.splice(
      appCore.firstCurrentNumberPosition,
      lastPosition,
      formattedNumber
    );
    appCore.expressionInput.value = expressionArray.join("");
  }

  addOperatorsOnDisplay(operator) {
    let expression = appCore.expressionInput.value;
    const lastChar = expression[expression.length - 1];
    const { openingCount, closingCount } = appCore.countParentheses(expression);

    if (
      lastChar != "(" &&
      !appCore.isNotCalculable &&
      expression.indexOf("Bin(") === -1 &&
      expression.indexOf("Oct(") === -1 &&
      expression.indexOf("Hex(") === -1 &&
      expression.indexOf("Fib(") === -1
    ) {
      let expressionArray = [...expression];

      if (!expression) {
        if (operator == "-") {
          appCore.expressionInput.value += operator;
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
            expression.indexOf("Fib(") !== -1 ||
            (expression.indexOf("Log(") !== -1 &&
              expression.indexOf("Log(") + 4 === expression.length) ||
            (expression.indexOf("Ln(") !== -1 &&
              expression.indexOf("Ln(") + 3 === expression.length)
          ) {
            cantAddOperators = true;
          }

          if (!cantAddOperators) {
            operator = appCore.handleSignRule(
              lastChar,
              expressionArray,
              operator
            );

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
      }

      appCore.currentNumber = "";
      this.handleFontSize();
    }
  }

  addCharactersOnDisplay(expression, inputChar) {
    const lastChar = expression[expression.length - 1];
    const { openingCount, closingCount } = appCore.countParentheses(expression);

    if (
      (openingCount > closingCount &&
        !isNaN(Number(lastChar)) &&
        inputChar != "(") ||
      (openingCount > closingCount && lastChar == ")" && inputChar == ")") ||
      (isNaN(Number(lastChar)) &&
        lastChar != ")" &&
        lastChar != "π" &&
        lastChar != "e" &&
        lastChar != "!" &&
        inputChar != ")" &&
        inputChar != "!") ||
      ((!isNaN(Number(lastChar)) || lastChar == ")") && inputChar == "!") ||
      (lastChar == "!" &&
        ((openingCount > closingCount && inputChar == ")") || inputChar == "!"))
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

      appCore.expressionInput.value += inputChar;
      expression += inputChar;
    }

    if (appCore.expressionInput.value) {
      if (!appCore.haveSeparateCalculations) {
        appCore.haveSeparateCalculations = true;
      }

      if (
        inputChar == "!" ||
        (isNaN(Number(lastChar)) && (inputChar == "π" || inputChar == "e"))
      ) {
        appCore.handleExpressions(expression);
      }

      this.handleFontSize();
    }
  }

  handleFontSize() {
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
  }

  showResult(result) {
    this.applyNewStylingClasses(result);
    appCore.expressionResult.textContent = result;
  }

  applyNewStylingClasses(result = "") {
    appCore.expressionInput.classList.add("has-transition");
    this.resultContainer.classList.add("has-transition");
    appCore.expressionResult.classList.add("has-transition");

    if (result) {
      appCore.expressionInput.classList.add("has-result");

      appCore.expressionInput.classList.remove("has-transition");
      this.resultContainer.classList.remove("invisible", "has-transition");
      appCore.expressionResult.classList.remove("has-transition");
    }
  }

  focalizeResult() {
    appCore.expressionOperators = [];

    if (!appCore.isNotCalculable) {
      if (
        appCore.expressionInput.value &&
        appCore.expressionResult.textContent
      ) {
        this.handleAddingOperationsOnHistory();
      }

      this.setDefaultStylingClasses();
      appCore.expressionInput.value = appCore.expressionResult.textContent;
      appCore.expressionResult.textContent = "";
      appCore.currentNumber = appCore.expressionInput.value;
      appCore.firstCurrentNumberPosition = 0;
      return;
    }

    appCore.expressionInput.value = "Expressão inválida";
  }

  setDefaultStylingClasses() {
    this.resultContainer.classList.add("invisible");
    appCore.expressionInput.classList.remove("has-result", "has-transition");
    this.resultContainer.classList.remove("has-transition");
    appCore.expressionResult.classList.remove("has-transition");
  }

  clearModal() {
    this.modal.classList.value = "";
    this.modalTitle.textContent = "";
    this.historyModalContent.classList.add("invisible");
    this.shortcutsModalContent.classList.add("invisible");
    this.personalizationModalContent.classList.add("invisible");
  }

  handleModalState() {
    if (!this.modalOverlay.classList.value.includes("invisible")) {
      this.clearModal();
    }

    this.modalOverlay.classList.toggle("invisible");
  }

  handleModalVisibilityConflicts() {
    !this.modalOverlay.classList.value.includes("invisible")
      ? this.clearModal()
      : this.handleModalState();

    if (!this.optionsBox.classList.value.includes("invisible")) {
      this.handleOptionsBox();
    }
  }

  handleHistoryAccess() {
    this.handleModalVisibilityConflicts();
    this.modal.classList.add("history-modal");
    this.modalTitle.textContent = "Histórico";
    this.historyModalContent.classList.remove("invisible");
  }

  handleAddingOperationsOnHistory(operationData = null, index = null) {
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

    let operationInfo = this.createOperationInfo(operationData);

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
  }

  createContentElements(operationData, operationInfo) {
    const contentContainer = document.createElement("div");

    const operationsDate = document.createElement("h3");
    operationsDate.textContent = operationData.operationDate;

    const operationsInfo = document.createElement("div");
    operationsInfo.classList.add("operations-info");

    operationsInfo.appendChild(operationInfo);
    contentContainer.appendChild(operationsDate);
    contentContainer.appendChild(operationsInfo);
    this.historyModalContent.appendChild(contentContainer);
  }

  createOperationInfo(operationData) {
    const operationInfo = document.createElement("div");

    const performedExpression = document.createElement("p");
    performedExpression.textContent = operationData.expression;

    const expressionResult = document.createElement("p");
    expressionResult.textContent = operationData.result;

    operationInfo.appendChild(performedExpression);
    operationInfo.appendChild(expressionResult);
    return operationInfo;
  }

  handleShortcutsAccess() {
    this.handleModalVisibilityConflicts();
    this.modal.classList.add("shortcuts-modal");
    this.modalTitle.textContent = "Atalhos do Teclado";
    this.shortcutsModalContent.classList.remove("invisible");
  }

  handlePersonalizationAccess() {
    this.handleModalVisibilityConflicts();
    this.modal.classList.add("personalization-modal");
    this.modalTitle.textContent = "Personalização";
    this.personalizationModalContent.classList.remove("invisible");
  }

  handleCurrentInputColor() {
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
        this.copyCurrentColorToNewColorField
      );

      currentColorTableData.childNodes.length
        ? currentColorTableData.replaceChild(
            currentColorInput,
            currentColorTableData.querySelector("input.current-color")
          )
        : currentColorTableData.appendChild(currentColorInput);
    });
  }

  copyCurrentColorToNewColorField({ target }) {
    const currentColorInput = target;
    const unformattedCurrentColor = currentColorInput.style.backgroundColor;
    const splittedCurrentColor = unformattedCurrentColor
      .replace(/[^0-9\,]/g, "")
      .split(",");
    let formattedCurrentColor = "#";

    splittedCurrentColor.forEach((colorChannelValue) => {
      let convertedColorChannelValue = appCore.calculateConversions(
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

  triggerColorInput({ target }) {
    const fakeColorInput = target;
    const colorInput = fakeColorInput.nextElementSibling;

    colorInput.click();
    colorInput.addEventListener("change", () => {
      fakeColorInput.style.backgroundColor = colorInput.value;
    });
  }

  applyDefaultColorValue() {
    const colorInputs = document.getElementsByName("new-color");

    colorInputs.forEach((input) => {
      const fakeColorInput = input.previousElementSibling;

      fakeColorInput.style.backgroundColor = "#000000";
      input.value = "#000000";
    });
  }

  showPersonalizedThemePreview() {
    this.modalOverlay.classList.add("invisible");

    const colorInputs = document.getElementsByName("new-color");

    colorInputs.forEach((input, index) => {
      document.body.style.setProperty(this.cssVariables[index], input.value);
    });

    document.body.onmouseup = () => this.stopShowingPersonalizedThemePreview();
  }

  stopShowingPersonalizedThemePreview() {
    this.modalOverlay.classList.remove("invisible");
    document.body.onmouseup = null;

    const userTheme = localStorage.getItem("devcalc-userDefaultTheme");
    document.body.removeAttribute("style");

    if (userTheme !== "" || userTheme != "dark-theme") {
      document.body.setAttribute("style", userTheme);
    }
  }

  createPersonalizedTheme() {
    const colorInputs = document.getElementsByName("new-color");
    const isValidTheme = appCore.validateThemes(colorInputs);

    if (isValidTheme) {
      colorInputs.forEach((input, index) => {
        document.body.style.setProperty(this.cssVariables[index], input.value);
      });

      const currentTheme = document.body.getAttribute("style");

      localStorage.setItem("devcalc-userCustomTheme", currentTheme);
      localStorage.setItem("devcalc-userDefaultTheme", currentTheme);

      this.switchThemeIcon(currentTheme);
      this.handleCurrentInputColor();
      this.applyDefaultColorValue();
    }
  }
}
