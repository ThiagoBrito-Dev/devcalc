const calcContainer = document.querySelector("main");
const resultMode = document.querySelector("#result-mode");
const conversionMode = document.querySelector("#conversion-mode");
const themeIcon = document.querySelector("#theme-icon");
const optionsIcon = document.querySelector("#options-icon");
const expressionInput = document.querySelector("input");
const expressionResult = document.querySelector("p");
const deleteIcon = document.querySelector("#delete-icon");
const topContainer = document.querySelector(".dev-mode-top-container");
const sideContainer = document.querySelector(".dev-mode-side-container");

let currentMode;
let expressionOperator;
let lastNumber;
let firstValue;
let isSameExpression = false;
let isDeleting = false;
let lastDigit;
let isLastExpression = false;
let currentExpressionNumber = "";
let firstPosition;
let isInvalid = false;

function initializeInterface() {
  const userTheme = localStorage.getItem("userTheme");

  document.body.classList = userTheme;
  toggleImageSource(userTheme);

  calcContainer.classList.add("visible");
}

function handleKeyboardInteractions(event) {
  if (!isNaN(Number(event.key)) || event.key == ",") {
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
      case "/":
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
  const isDarkTheme = theme == "dark-theme";

  themeIcon.src = isDarkTheme ? "assets/sun.png" : "assets/moon.png";
  optionsIcon.src = isDarkTheme
    ? "assets/options-white.png"
    : "assets/options.png";
  deleteIcon.src = isDarkTheme ? "assets/delete-dark.png" : "assets/delete.png";
}

function toggleResultMode() {
  currentMode = resultMode.textContent;
  resultMode.textContent = currentMode.includes("RAD") ? "GRAU" : "RAD";
}

function handleConversionMode() {
  const modes = ["DECI", "BIN", "OCT", "HEX"];

  if (!conversionMode.textContent.includes(" ")) {
    const currentMode = conversionMode.textContent.trim();

    for (let mode in modes) {
      if (modes[mode] === currentMode) {
        conversionMode.textContent = modes[++mode];

        if (conversionMode.textContent === "") {
          conversionMode.textContent = modes[0];
        }
      }
    }
  } else {
    conversionMode.textContent = "DECI";
  }

  addCharactersOnDisplay(`${conversionMode.textContent}(`.toLowerCase());
}

function toggleDevMode() {
  if (conversionMode.classList.value !== "invisible") {
    conversionMode.textContent = "DECI";
  }

  conversionMode.classList.toggle("invisible");
  expressionInput.classList.toggle("stretch");
  topContainer.classList.toggle("invisible");
  sideContainer.classList.toggle("invisible");

  expressionInput.classList.remove("has-transition");
}

function addNumbersOnDisplay(number) {
  const expression = expressionInput.value;
  const lastSymbol = Number(expression[expression.length - 1]);

  if (number != "," || (expression.length >= 1 && !isNaN(lastSymbol))) {
    console.log("Último número: " + lastNumber);
    if (!expressionResult.textContent) {
      if (expression.includes(",") && number == ",") {
        return;
      }
    } else if (lastNumber) {
      if (lastNumber.includes(".") && number == ",") {
        return;
      }
    }

    expressionInput.value += number;

    if (isNaN(Number(expressionInput.value))) {
      if (
        expressionOperator == "/" &&
        (Number(number) == "0" || number == ",")
      ) {
        setDefaultStylingClasses();
        isInvalid = true;
      } else {
        isInvalid = false;
        triggerCalculation(number);
      }
    }
  }

  handleFontSize();
  formatExpressionNumbers(number);
}

function formatExpressionNumbers(number = "") {
  let expression = expressionInput.value;

  if (expression && expression != "-") {
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
}

function addOperatorsOnDisplay(operator) {
  let expression = expressionInput.value;
  let expressionArray = [];

  for (let symbol in expression) {
    expressionArray.push(expression[symbol]);
  }

  const lastSymbol = expressionArray[expressionArray.length - 1];

  if (!expression) {
    if (operator == "-" || operator == "√") {
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
      expressionInput.value = expression
        .replace("**", "^")
        .replace("*", "x")
        .replace("/", "÷");
    }
  }

  currentExpressionNumber = "";
  handleFontSize();
}

function addCharactersOnDisplay(char) {
  expressionInput.value = char;
}

function focalizeResult() {
  expressionInput.value = "Expressão inválida";

  if (!isInvalid) {
    setDefaultStylingClasses();
    expressionInput.value = expressionResult.textContent;
    expressionResult.textContent = "";
    currentExpressionNumber = "";
  }
}

function handleFontSize() {
  const expression = expressionInput.value;
  const fontSize = expressionInput.style.fontSize;

  if (expression.length >= 18 && fontSize != "16.5px") {
    expressionInput.style.fontSize = "16.5px";
  } else if (expression.length < 18 && fontSize != "20px" && fontSize != "") {
    expressionInput.style.fontSize = "20px";
  }
}

function triggerCalculation() {
  let expression = "";
  let expressionArray = [];
  let numbersArray = [];
  let number = "";
  let char;

  for (let symbol in expressionInput.value) {
    char = expressionInput.value[symbol];

    if (
      expressionInput.value != "," &&
      isNaN(Number(expressionInput.value[symbol]))
    ) {
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

      numbersArray.push(number);
      number = "";
    } else {
      number += char;
    }

    expression += char;
    expressionArray.push(char);
  }

  let splittedExpression = expression.split(expressionOperator);

  if (numbersArray.length == 1 && !splittedExpression[1]) {
    isLastExpression = true;
  } else {
    isLastExpression = false;
  }

  if (expressionResult.textContent) {
    lastNumber = splittedExpression[splittedExpression.length - 1];
    lastNumber = lastNumber.replace(",", ".");

    if (isNaN(Number(lastNumber)) || isDeleting) {
      let lastOperator;
      expressionArray.reverse();

      for (let symbol in expressionArray) {
        if (!lastOperator) {
          if (
            expressionArray[symbol] != "," &&
            isNaN(Number(expressionArray[symbol]))
          ) {
            lastOperator = expressionArray[symbol];
            expressionOperator = lastOperator;
          }
        }
      }

      splittedExpression = expression.split(lastOperator);
      lastNumber = splittedExpression[splittedExpression.length - 1];
      lastNumber = lastNumber.replace(",", ".");

      if (numbersArray.length == 1 && !splittedExpression[1]) {
        isLastExpression = true;
      } else {
        isLastExpression = false;
      }
    }

    if (lastDigit == "") {
      lastDigit = lastNumber;
    }

    if (lastNumber.includes(".") || lastNumber.length > 1) {
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
    .replace("^", "**")
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
          let diferenceBetweenExpressionNumbers = Number(
            lastNumber.slice(0, -1).replace(",", ".")
          );
          firstNumber = Number(firstNumber);

          if (
            firstValue != 0 &&
            expressionOperator == "*" &&
            firstNumber == 0
          ) {
            firstNumber = firstValue;
          }

          switch (expressionOperator) {
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
              firstNumber = Math.sqrt(firstNumber);
              break;
            case "/":
              if (!diferenceBetweenExpressionNumbers) {
                diferenceBetweenExpressionNumbers = 1;
              }

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
              case "**":
                console.log("Último dígito: " + lastDigit);
                console.log("Primeiro número antes: " + firstNumber);
                // firstNumber = firstNumber - (firstNumber - 3);
                firstNumber = Math.floor(Math.sqrt(firstNumber));
                console.log("Primeiro número depois: " + firstNumber);
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
      console.log("Números: ", numbers);

      if (numbers[1] == 0) {
        firstValue = numbers[0];
      }

      if (isNaN(firstSymbol)) {
        shortExpression = completeExpression.slice(1);
        numbers = shortExpression.split(expressionOperator);
        numbers[0] = firstSymbol + numbers[0];
      }

      numbers = [Number(numbers[0]), Number(numbers[1])];

      switch (expressionOperator) {
        case "+":
          result = numbers[0] + numbers[1];
          break;
        case "-":
          result = numbers[0] - numbers[1];
          break;
        case "*":
          if (numbers[1] == 0 && lastNumber == "") {
            numbers[1] = 1;
          }

          result = numbers[0] * numbers[1];
          break;
        case "**":
          result = numbers[0] ** numbers[1];
          break;
        case "/":
          if (numbers[1] == 0) {
            numbers[1] = 1;
          }

          result = numbers[0] / numbers[1];
          break;
        case "%":
          result = numbers[0] % numbers[1];
          break;
      }

      if (expressionOperator == "**" && String(result).includes(".")) {
        result = String(result).replace(".", ",");
      } else {
        result = result.toLocaleString("pt-BR");
      }
      showResult(result);
    }
  } else {
    expressionResult.textContent = "";
    setDefaultStylingClasses();
  }
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
  currentExpressionNumber = "";
  firstPosition = "";
  isInvalid = false;

  setDefaultStylingClasses();
  handleFontSize();
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
      if (expression[symbol] !== "." && symbol >= firstPosition) {
        currentExpressionNumber += expression[symbol];
      }
    }

    isDeleting = true;
    formatExpressionNumbers();
    triggerCalculation();
    isDeleting = false;
    isInvalid = false;

    handleFontSize();
  }
}
