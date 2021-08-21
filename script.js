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
  let userTheme = localStorage.getItem("userTheme");

  if (userTheme === null) {
    userTheme = "";
  }

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
  const resultMode = document.querySelector("#result-mode");

  currentMode = resultMode.textContent;
  resultMode.textContent = currentMode.includes("RAD") ? "GRAU" : "RAD";
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
  const currentMode = conversionMode.textContent.trim();
  handleAddingNumbersOrCharacters(`${currentMode}(`.toLowerCase());
}

function toggleDevMode() {
  const topContainer = document.querySelector(".dev-mode-top-container");
  const conversionContainer = document.querySelector(".conversion-container");
  const sideContainer = document.querySelector(".dev-mode-side-container");

  if (conversionContainer.classList.value != "invisible") {
    conversionMode.textContent = "BIN";
  }

  topContainer.classList.toggle("invisible");
  conversionContainer.classList.toggle("invisible");
  expressionInput.classList.toggle("stretch");
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
  const numbersArray = handleNumbersArray(expression);

  if (numbersArray) {
    const lastNumberPosition = numbersArray.length - 1;
    const lastNumber = numbersArray[lastNumberPosition];

    if (
      (expression.includes(",") && number == ",") ||
      (lastNumber.includes(",") && number == ",")
    ) {
      return false;
    }
  }

  return true;
}

function handleValidExpressions(expression, number) {
  const numbersArray = handleNumbersArray(expression);

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
      Number(lastNumber) == "0"
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
  const [openingCount, closingCount] = countParentheses(expression);

  if (
    (openingCount > closingCount && isNaN(Number(lastChar))) ||
    (openingCount > closingCount &&
      !isNaN(Number(lastChar)) &&
      inputChar != "(") ||
    (isNaN(Number(lastChar)) && lastChar != ")" && inputChar != ")")
  ) {
    if (inputChar == "bin(" || inputChar == "oct(" || inputChar == "hex(") {
      if (expression) {
        return;
      }
    }

    expressionInput.value += inputChar;
  }

  if (!haveSeparateCalculations) {
    haveSeparateCalculations = true;
  }

  currentNumber = "";
}

function addOperatorsOnDisplay(operator) {
  let expression = expressionInput.value;
  const [openingCount, closingCount] = countParentheses(expression);

  if (
    openingCount > closingCount ||
    (expression.indexOf("bin(") === -1 &&
      expression.indexOf("oct(") === -1 &&
      expression.indexOf("hex(") === -1)
  ) {
    let expressionArray = getExpressionArray(expression);
    const lastChar = expression[expression.length - 1];

    if (!expression) {
      if (operator == "-") {
        expressionInput.value += operator;
      }
    } else {
      if (expression.length > 1 || !isNaN(Number(lastChar))) {
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

    currentNumber = "";
    handleFontSize(expression);
  }
}

function handleSignRule(lastChar, expressionArray, operator) {
  if (isNaN(Number(lastChar)) && lastChar != ")" && lastChar != "!") {
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
  let expression = getExpressionArray(expressionInput.value, true).join("");

  if (!isInvalidExpression) {
    if (expression.indexOf(currentOperator) !== -1) {
      expression = getExpressionArray(expressionInput.value).join("");
      expression = unformatNumbers(expression).replace(",", ".");

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

      result = formatExpressionResult(result);
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

function handleNumbersArray(expression) {
  if (haveSeparateCalculations) {
    expression = handleSeparateCalculations(expression);
  }

  let firstCharIsAnOperator = false;
  let firstChar;

  if (expression && expression[0] == "-") {
    expression = expression.slice(1);
    firstCharIsAnOperator = true;
    firstChar = "-";
  }

  const numbersArray = getNumbersArray(expression, expressionOperators);

  if (firstCharIsAnOperator) {
    numbersArray[0] = firstChar + numbersArray[0];
  }

  return numbersArray;
}

function getNumbersArray(splittedExpression, operators) {
  splittedExpression = String(splittedExpression);
  let numbersArray;

  if (splittedExpression) {
    for (let operator in operators) {
      const currentOperator = operators[operator]
        .replace("**", "^")
        .replace("*", "x")
        .replace("/", "÷");

      splittedExpression = splittedExpression.split(currentOperator);
      splittedExpression = splittedExpression.join(" ");
    }

    numbersArray = splittedExpression.split(" ");
  }

  return numbersArray;
}

function handleSeparateCalculations(expression, hasOperations = false) {
  expression = expression.replace(/\,/g, ".");

  let openingParenthesisCount = 0;
  let closingParenthesisCount = 0;

  let newExpression;
  let resultNumberIndex;
  let firstOpeningParenthesisIndex;
  let newFirstOpeningParenthesisIndex;
  let newOpeningParenthesisPosition;
  let lastClosingParenthesisIndex;

  if (expression.indexOf("(") === -1) {
    return calculateUnaryMathOperators(expression);
  }

  for (let char in expression) {
    const currentChar = expression[char];

    if (currentChar == "(") {
      openingParenthesisCount++;

      if (!firstOpeningParenthesisIndex) {
        firstOpeningParenthesisIndex = char;
      }
    } else if (currentChar == ")") {
      closingParenthesisCount++;
    }

    if (openingParenthesisCount === closingParenthesisCount) {
      firstOpeningParenthesisIndex = "";
      newFirstOpeningParenthesisIndex = "";
    }

    if (firstOpeningParenthesisIndex) {
      const previousIndex = firstOpeningParenthesisIndex - 1;
      const previousChar = expression[previousIndex]
        .replace("^", "**")
        .replace("x", "*")
        .replace("÷", "/");
      let currentMode = "";

      if (
        previousChar != "(" &&
        expressionOperators.indexOf(previousChar) === -1
      ) {
        for (let index = previousIndex; index > -1; index--) {
          const currentChar = expression[index]
            .replace("x", "*")
            .replace("^", "**")
            .replace("÷", "/");

          if (expressionOperators.indexOf(currentChar) !== -1) {
            break;
          }

          currentMode += expression[index];
        }

        currentMode = [...currentMode].reverse().join("");
      }

      const nextIndex = Number(firstOpeningParenthesisIndex) + 1;
      let partOfExpression = expression.slice(nextIndex);

      const [openingCount, closingCount, closingIndex] = countParentheses(
        partOfExpression,
        true
      );

      if (closingIndex || closingCount === openingCount) {
        lastClosingParenthesisIndex = closingIndex;
        partOfExpression = partOfExpression.slice(
          0,
          lastClosingParenthesisIndex
        );
      }

      const lengthOfPartOfExpression = partOfExpression.length;

      if (partOfExpression.indexOf("(") !== -1) {
        const operators = getOperatorsArray(partOfExpression);

        if (operators.length) {
          partOfExpression = handleSeparateCalculations(partOfExpression, true);
        } else {
          partOfExpression = handleSeparateCalculations(partOfExpression);
        }
      }

      partOfExpression = calculateUnaryMathOperators(partOfExpression);
      const operators = getOperatorsArray(partOfExpression);
      let modesCount = 0;

      if (currentMode) {
        for (let char in expression) {
          const currentChar = expression[char];

          if (currentChar == "(") {
            const previousChar = expression[char - 1];

            if (
              previousChar != "(" &&
              expressionOperators.indexOf(previousChar) === -1
            ) {
              modesCount++;
            }
          }
        }

        if (!operators.length) {
          let conversionResult;

          switch (currentMode) {
            case "bin":
              conversionResult = (partOfExpression >>> 0).toString(2);
              break;
            case "oct":
              conversionResult = Number(partOfExpression).toString(8);
              break;
            case "hex":
              conversionResult = Number(partOfExpression).toString(16);
              break;
            case "sin":
              conversionResult = Math.sin(partOfExpression);
              break;
            case "cos":
              conversionResult = Math.cos(partOfExpression);
              break;
            case "tan":
              conversionResult = Math.tan(partOfExpression);
              break;
          }

          partOfExpression = conversionResult;
        }
      }

      const numbersArray = getNumbersArray(partOfExpression, operators);

      if ((numbersArray && numbersArray.length > 1) || hasOperations) {
        let result;

        for (let number in numbersArray) {
          result = calculateResult(numbersArray, number, operators, result);

          if (openingParenthesisCount < 2) {
            let expressionArray = getExpressionArray(expression);

            if (currentMode) {
              let conversionResult;

              if (!operators.length) {
                expressionArray.splice(
                  firstOpeningParenthesisIndex - currentMode.length,
                  lengthOfPartOfExpression + 2 + currentMode.length,
                  result
                );
              } else {
                switch (currentMode) {
                  case "bin":
                    conversionResult = (result >>> 0).toString(2);
                    break;
                  case "oct":
                    conversionResult = Number(result).toString(8);
                    break;
                  case "hex":
                    conversionResult = Number(result).toString(16);
                    break;
                  case "sin":
                    conversionResult = Math.sin(result);
                    break;
                  case "cos":
                    conversionResult = Math.cos(result);
                    break;
                  case "tan":
                    conversionResult = Math.tan(result);
                    break;
                }

                expressionArray.splice(
                  firstOpeningParenthesisIndex - currentMode.length,
                  lengthOfPartOfExpression + currentMode.length + 2,
                  conversionResult
                );
              }
            } else {
              expressionArray.splice(
                firstOpeningParenthesisIndex,
                lengthOfPartOfExpression + 2,
                result
              );
            }

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
            } else if (
              newFirstOpeningParenthesisIndex !== -1 &&
              firstOpeningParenthesisIndex > newFirstOpeningParenthesisIndex
            ) {
              expressionArray.splice(
                newFirstOpeningParenthesisIndex,
                lengthOfPartOfExpression + 2,
                result
              );

              resultNumberIndex = newFirstOpeningParenthesisIndex;
            } else if (currentMode) {
              // if (newFirstOpeningParenthesisIndex) {
              //   expressionArray.splice(
              //     firstOpeningParenthesisIndex + 1,
              //     partOfExpression.length,
              //     result
              //   );
              // }

              expressionArray.splice(
                firstOpeningParenthesisIndex - currentMode.length,
                String(result).length,
                result
              );
            } else {
              let openingParenthesisPosition = newExpression.indexOf("(");
              resultNumberIndex = openingParenthesisPosition;

              expressionArray.splice(
                openingParenthesisPosition,
                partOfExpression.length + 2,
                result
              );
            }

            newExpression = expressionArray.join("");
          }
        }
      } else {
        if (newExpression) {
          if (partOfExpression) {
            const expressionArray = getExpressionArray(newExpression);
            let openingParenthesisPosition = expressionArray.indexOf("(");
            let deleteAmount =
              expressionArray.length - openingParenthesisPosition;

            if (currentMode) {
              const closingParenthesisPosition = newExpression.indexOf(")");

              if (newExpression.indexOf(partOfExpression) === -1) {
                if (closingParenthesisPosition !== -1) {
                  expressionArray.splice(
                    openingParenthesisPosition - currentMode.length,
                    closingParenthesisPosition -
                      openingParenthesisPosition +
                      1 +
                      currentMode.length,
                    partOfExpression
                  );
                } else {
                  if (openingParenthesisPosition === -1) {
                    openingParenthesisPosition = newOpeningParenthesisPosition;
                    deleteAmount =
                      expressionArray.length - openingParenthesisPosition;
                  }

                  newOpeningParenthesisPosition = openingParenthesisPosition;

                  expressionArray.splice(
                    openingParenthesisPosition - currentMode.length,
                    deleteAmount + currentMode.length,
                    partOfExpression
                  );
                }
              }

              newExpression = expressionArray.join("");
            } else {
              expressionArray.splice(
                openingParenthesisPosition,
                deleteAmount,
                partOfExpression
              );

              newExpression = expressionArray.join("");
              return newExpression;
            }
          } else {
            return newExpression.split("(").join("").split(")").join("");
          }
        } else {
          const expressionArray = getExpressionArray(expression);

          if (currentMode) {
            expressionArray.splice(
              firstOpeningParenthesisIndex - currentMode.length,
              currentMode.length + lengthOfPartOfExpression + 2,
              partOfExpression
            );

            if (modesCount > 1) {
              newExpression = expressionArray.join("");
              continue;
            }
          } else {
            expressionArray.splice(
              firstOpeningParenthesisIndex,
              lengthOfPartOfExpression + 2,
              partOfExpression
            );
          }

          return expressionArray.join("");
        }
      }
    }
  }

  return newExpression;
}

function calculateUnaryMathOperators(expression) {
  const expressionArray = getExpressionArray(expression);

  for (let char in expression) {
    const currentChar = expression[char];

    if (currentChar == "√" || currentChar == "!") {
      switch (currentChar) {
        case "√":
          const startIndex = expressionArray.indexOf("√");
          const nextIndex = Number(char) + 1;
          let slicedExpression = expression.slice(nextIndex);

          if (slicedExpression) {
            let partOfExpression = "";

            for (let char in slicedExpression) {
              const currentChar = slicedExpression[char];

              if (isNaN(Number(currentChar))) {
                break;
              }

              partOfExpression += slicedExpression[char];
            }

            const result = Math.sqrt(Number(partOfExpression));

            expressionArray.splice(
              startIndex,
              String(partOfExpression).length + 1,
              result
            );
          }

          break;
        case "!":
          const reversedExpression = [...expression].reverse();
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
