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
  const expression = unformatNumbers(expressionInput.value);
  const lastChar = expression[expression.length - 1];
  const modes = ["DECI", "BIN", "OCT", "HEX"];

  if (lastChar != ")") {
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
  let expression = unformatNumbers(expressionInput.value);

  if (char == "," || !isNaN(Number(char))) {
    addNumbersOnDisplay(expression, char);
  } else {
    addCharactersOnDisplay(expression, char);
  }
}

function addNumbersOnDisplay(expression, number) {
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
  const numbersArray = getNumbersArray(expression);
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
    Number(lastNumber) == "0"
  ) {
    setDefaultStylingClasses();
    isNotCalculable = true;
  } else {
    isNotCalculable = false;
    triggerCalculation(expression, numbersArray);
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

function addCharactersOnDisplay(expression, inputChar) {
  const lastChar = expression[expression.length - 1];
  let openingParenthesisCount = 0;
  let closingParenthesisCount = 0;

  for (let char in expression) {
    if (expression[char] == "(") {
      openingParenthesisCount++;
    } else if (expression[char] == ")") {
      closingParenthesisCount++;
    }
  }

  if (
    (openingParenthesisCount > closingParenthesisCount &&
      isNaN(Number(lastChar))) ||
    (!isNaN(Number(lastChar)) && inputChar != "(") ||
    (isNaN(Number(lastChar)) && lastChar != ")" && inputChar != ")")
  ) {
    expressionInput.value += inputChar;
  }

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
      let openingParenthesisCount = 0;
      let closingParenthesisCount = 0;

      for (let char in expression) {
        if (expression[char] == "(") {
          openingParenthesisCount++;
        } else if (expression[char] == ")") {
          closingParenthesisCount++;
        }
      }

      operator = handleSignRule(lastChar, expressionArray, operator);

      if (openingParenthesisCount === closingParenthesisCount) {
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
  const breakpoint = conversionMode.classList.value ? 18 : 25;

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
  const expressionArray = getExpressionArray(expression);

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
        if (number > 0) {
          const currentOperator = expressionOperators[number - 1];
          let currentNumber = Number(numbersArray[number]);

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
          result = Number(numbersArray[number]);
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
  haveSeparateCalculations = false;
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

    if (!splittedExpression) {
      splittedExpression = expression;
    }

    console.log("Nova expressão separada: " + splittedExpression);
  }

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

  if (firstCharIsAnOperator) {
    numbersArray[0] = firstChar + numbersArray[0];
  }

  return numbersArray;
}

function calculatePartsOfExpression(expression) {
  let newExpression;
  let resultNumberIndex;
  let firstOpeningParenthesisIndex;
  let newFirstOpeningParenthesisIndex;
  let lastClosingParenthesisIndex;
  let openingParenthesisCount = 0;
  let closingParenthesisCount = 0;

  for (let char in expression) {
    if (expression[char] == "(") {
      openingParenthesisCount++;

      if (!firstOpeningParenthesisIndex) {
        firstOpeningParenthesisIndex = char;
      }
    } else if (expression[char] == ")") {
      closingParenthesisCount++;
    }

    if (openingParenthesisCount === closingParenthesisCount) {
      firstOpeningParenthesisIndex = "";
      newFirstOpeningParenthesisIndex = "";
    }

    if (firstOpeningParenthesisIndex) {
      const nextIndex = Number(firstOpeningParenthesisIndex) + 1;
      let partOfExpression = expression.slice(nextIndex).replace(/\,/g, ".");
      let openCount = 0;
      let closeCount = 0;
      let closeIndex;

      for (let char in partOfExpression) {
        if (partOfExpression[char] == "(") {
          openCount++;
        } else if (partOfExpression[char] == ")") {
          closeCount++;

          if (!closeIndex && closeCount > openCount) {
            closeIndex = char;
          }
        }
      }

      if (closeIndex || closeCount === openCount) {
        lastClosingParenthesisIndex = closeIndex;
        partOfExpression = partOfExpression.slice(
          0,
          lastClosingParenthesisIndex
        );
      }

      const lengthOfPartOfExpression = partOfExpression.length;

      if (partOfExpression.indexOf("(") !== -1) {
        partOfExpression = calculatePartsOfExpression(partOfExpression);
      }

      const currentOperators = [];

      for (let char in partOfExpression) {
        const currentChar = partOfExpression[char]
          .replace("x", "*")
          .replace("^", "**")
          .replace("÷", "/");

        if (
          isNaN(Number(currentChar)) &&
          currentChar != "(" &&
          currentChar != ")" &&
          currentChar != "."
        ) {
          currentOperators.push(currentChar);
        }
      }

      let splittedExpression = partOfExpression;

      for (let operator in currentOperators) {
        const currentOperator = currentOperators[operator]
          .replace("**", "^")
          .replace("*", "x")
          .replace("/", "÷");

        splittedExpression = splittedExpression.split(currentOperator);
        splittedExpression = splittedExpression.join(" ");
      }

      let numbersArray = splittedExpression.split(" ");

      if (numbersArray.length > 1) {
        let result;

        for (let number in numbersArray) {
          if (number > 0) {
            const currentOperator = currentOperators[number - 1];
            let currentNumber = Number(numbersArray[number]);

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
            result = Number(numbersArray[number]);
          }

          if (openingParenthesisCount < 2) {
            let expressionArray = getExpressionArray(expression);

            expressionArray.splice(
              firstOpeningParenthesisIndex,
              lengthOfPartOfExpression + 2,
              result
            );

            newExpression = expressionArray.join("");
          } else {
            let expressionArray = getExpressionArray(newExpression);

            if (!newFirstOpeningParenthesisIndex) {
              newFirstOpeningParenthesisIndex = expressionArray.indexOf("(");
            }

            if (
              expressionArray.indexOf("(") != newFirstOpeningParenthesisIndex
            ) {
              const nextNumberIndex = resultNumberIndex + 1;

              if (
                !isNaN(Number(expressionArray[resultNumberIndex])) &&
                !isNaN(Number(expressionArray[nextNumberIndex]))
              ) {
                expressionArray.splice(
                  resultNumberIndex,
                  String(result).length,
                  result
                );
              } else {
                expressionArray.splice(resultNumberIndex, 1, result);
              }
            } else {
              if (
                newFirstOpeningParenthesisIndex !== -1 &&
                firstOpeningParenthesisIndex > newFirstOpeningParenthesisIndex
              ) {
                expressionArray.splice(
                  newFirstOpeningParenthesisIndex,
                  lengthOfPartOfExpression + 2,
                  result
                );

                resultNumberIndex = newFirstOpeningParenthesisIndex;
              }
            }

            newExpression = expressionArray.join("");
          }
        }
      } else {
        if (newExpression) {
          if (partOfExpression) {
            const expressionArray = getExpressionArray(newExpression);
            const parenthesisPosition = expressionArray.indexOf("(");
            const deleteAmount = expressionArray.length - parenthesisPosition;

            expressionArray.splice(
              parenthesisPosition,
              deleteAmount,
              partOfExpression
            );

            newExpression = expressionArray.join("");
            return newExpression;
          } else {
            return newExpression.split("(").join("").split(")").join("");
          }
        } else {
          expression = expression.slice(0, firstOpeningParenthesisIndex);
          return expression + partOfExpression;
        }
      }
    }
  }

  return newExpression;
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
