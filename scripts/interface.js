import AppCore from "./core.js";

const appCore = new AppCore();

export default class AppInterface {
  constructor() {
    this.conversionMode = document.querySelector("#conversion-mode");
    this.optionsBox = document.querySelector(".options-box");
    this.resultContainer = document.querySelector(".result-container");

    this.modalOverlay = document.querySelector(".modal-overlay");
    this.modal = document.querySelector(".modal-overlay section");
    this.modalTitle = document.querySelector("#modal-title");
    this.historyModalContent = document.querySelector(".history-modal-content");
    this.shortcutsModalContent = document.querySelector(
      ".shortcuts-modal-content"
    );
    this.personalizationModalContent = document.querySelector(
      ".personalization-modal-content"
    );

    this.operations;
  }

  initializeInterface() {
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
    this.toggleThemeIcon(userTheme);
    this.handleCurrentInputColor();
  }

  handleKeyboardShortcuts(event) {
    if (event.key !== " " && (event.key == "," || !isNaN(Number(event.key)))) {
      this.addNumbersOnDisplay(appCore.expressionInput.value, event.key);
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
        this.addOperatorsOnDisplay(key);
      } else {
        switch (event.key) {
          case "r":
            this.toggleResultMode();
            break;
          case "t":
            this.toggleTheme();
            break;
          case "l":
            this.clearExpressions();
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

    currentMode = resultMode.textContent;
    resultMode.textContent = currentMode.includes("RAD") ? "GRAU" : "RAD";

    if (
      expression.indexOf("Sin(") !== -1 ||
      expression.indexOf("Cos(") !== -1 ||
      expression.indexOf("Tan(") !== -1
    ) {
      appCore.handleCalculationResult(false);
    }
  }

  changeConversionMode() {
    const modes = ["BIN", "OCT", "HEX"];
    const currentMode = this.conversionMode.textContent.trim();

    for (let mode in modes) {
      if (modes[mode] == currentMode) {
        this.conversionMode.textContent = modes[++mode];

        if (this.conversionMode.textContent === "") {
          this.conversionMode.textContent = modes[0];
        }
      }
    }
  }

  addConversionModeOnInput() {
    let currentMode = [...this.conversionMode.textContent.trim().toLowerCase()];
    currentMode[0] = currentMode[0].toUpperCase();
    currentMode = currentMode.join("");

    this.handleAddingNumbersOrCharacters(`${currentMode}(`);
  }

  toggleTheme() {
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
    this.toggleThemeIcon(currentTheme);
    this.handleCurrentInputColor();
  }

  toggleThemeIcon(theme) {
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
    const body = document.querySelector("body");

    if (this.optionBox.classList.value.includes("invisible")) {
      this.optionBox.classList.remove("invisible");
      setTimeout(() => {
        body.onclick = this.handleOptionsBox;
      }, 50);
    } else {
      this.optionsBox.classList.add("invisible");
      body.onclick = null;
    }
  }

  clearExpressions() {
    appCore.expressionInput.value = "";
    appCore.expressionResult.textContent = "";
    appCore.currentNumber = "";
    appCore.firstPosition = "";
    appCore.isNotCalculable = false;
    appCore.haveSeparateCalculations = false;
    appCore.expressionOperators = [];

    this.setDefaultStylingClasses();
    this.handleFontSize();
  }

  deleteLastCharacter() {
    if (appCore.expressionInput.value) {
      let expression = appCore.expressionInput.value;
      const expressionArray = [...expression];
      const lastPositions = [
        expressionArray.length - 1,
        appCore.expressionOperators.length - 1,
      ];

      const lastExpressionChar = expressionArray[lastPositions[0]]
        .replace("x", "*")
        .replace("^", "**")
        .replace("÷", "/");
      const lastOperator = appCore.expressionOperators[lastPositions[1]];

      if (lastExpressionChar == lastOperator) {
        appCore.expressionOperators.pop();
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

      const lastChar = expression[expression.length - 1];

      appCore.getNewCurrentNumberValue(expression);
      appCore.formatNumbers(expression);
      appCore.handleValidExpressions(expression, lastChar);
      this.handleFontSize(expression);
    }
  }

  toggleDevMode() {
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
    this.handleFontSize(appCore.expressionInput.value);
  }

  addOperatorsOnDisplay(operator) {
    let expression = appCore.expressionInput.value;
    const [openingCount, closingCount] = appCore.countParentheses(expression);

    if (
      (openingCount > closingCount &&
        expression[expression.length - 1] != "(") ||
      (expression.indexOf("Bin(") === -1 &&
        expression.indexOf("Oct(") === -1 &&
        expression.indexOf("Hex(") === -1 &&
        expression.indexOf("Fib(") === -1)
    ) {
      let expressionArray = [...expression];
      const lastChar = expression[expression.length - 1];

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
            (expression.indexOf("Log(") !== -1 &&
              expression.indexOf("Log(") + 4 === expression.length) ||
            (expression.indexOf("Ln(") !== -1 &&
              expression.indexOf("Ln(" + 3 === expression.length))
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
      this.handleFontSize(expression);
    }
  }

  handleAddingNumbersOrCharacters(char) {
    let expression = appCore.expressionInput.value.replace(/\./g, "");

    if (char == "," || !isNaN(Number(char))) {
      this.addNumbersOnDisplay(expression, char);
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
          expression = appCore.expressionInput.value.replace(/\./g, "");

          if (isNaN(Number(expression))) {
            appCore.handleValidExpressions(expression, number);
          }
        }

        appCore.formatNumbers(expression, number);
      }

      this.handleFontSize(appCore.expressionInput.value);
    }
  }

  addFormattedNumbersOnDisplay(formattedNumber) {
    const expressionArray = [...appCore.expressionInput.value];
    const lastPosition = formattedNumber.length + 1;

    expressionArray.splice(
      appCore.firstPosition,
      lastPosition,
      formattedNumber
    );
    appCore.expressionInput.value = expressionArray.join("");
  }

  addCharactersOnDisplay(expression, inputChar) {
    const lastChar = expression[expression.length - 1];
    const [openingCount, closingCount] = appCore.countParentheses(expression);

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

      appCore.expressionInput.value += inputChar;
    }

    if (appCore.expressionInput.value) {
      if (!appCore.haveSeparateCalculations) {
        appCore.haveSeparateCalculations = true;
      }

      if (inputChar == "!" || inputChar == "π" || inputChar == "e") {
        appCore.handleCalculationResult(false);
      }

      appCore.currentNumber = "";
      this.handleFontSize(expression);
    }
  }

  handleFontSize(expression) {
    const conversionContainer = document.querySelector(".conversion-container");

    if (!expression) {
      expression = appCore.expressionInput.value;
    }

    const fontSize = appCore.expressionInput.style.fontSize;
    const breakpoint = conversionContainer.classList.value.includes("invisible")
      ? 18
      : 25;

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

  applyNewStylingClasses(result) {
    appCore.expressionInput.classList.add("has-transition");
    this.resultContainer.classList.add("has-transition");
    appCore.expressionResult.classList.add("has-transition");

    if (result) {
      appCore.expressionInput.classList.add("has-result");

      appCore.expressionInput.classList.remove("has-transition");
      this.resultContainer.classList.remove("invisible");
      this.resultContainer.classList.remove("has-transition");
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
        handleAddingOperationsOnHistory();
      }

      setDefaultStylingClasses();
      appCore.expressionInput.value = appCore.expressionResult.textContent;
      appCore.expressionResult.textContent = "";
      appCore.currentNumber = appCore.expressionInput.value;
      appCore.firstPosition = 0;
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

  copyCurrentColorToNewColorField(event) {
    const unformattedCurrentColor = event.target.style.backgroundColor;
    const splittedCurrentColor = unformattedCurrentColor
      .replace(/[^0-9\,]/g, "")
      .split(",");
    let formattedCurrentColor = "#";

    splittedCurrentColor.forEach((colorChannelValue) => {
      let convertedColorChannelValue = appCore.calculateConversions(
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

  triggerColorInput() {
    const fakeColorInput = event.target;
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

    console.log(this);
    document.body.onmouseup = this.stopShowingPersonalizedThemePreview;
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
      this.handleCurrentInputColor();
      this.applyDefaultColorValue();

      localStorage.setItem(
        "devcalc-userCustomTheme",
        document.body.getAttribute("style")
      );
    }
  }
}
