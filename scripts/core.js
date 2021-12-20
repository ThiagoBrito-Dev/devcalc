import AppInterface from "./interface.js";

const appInterface = new AppInterface();

export default function AppCore() {
  this.expressionInput = document.querySelector("div#display input");
  this.expressionResult = document.querySelector("div#result-container p");
  this.operatorsExample = ["+", "-", "*", "/", "**", "%"];

  this.isNotCalculable = false;
  this.haveSeparateCalculations = false;

  this.expressionOperators = [];
  this.currentNumber = "";
  this.firstCurrentNumberPosition;
}

AppCore.prototype.updateCurrentNumberValue = function (expression) {
  let currentNumber = "";

  for (let index = expression.length - 1; index >= 0; index--) {
    const currentChar = expression[index];

    if (!isNaN(Number(currentChar)) || currentChar == ",") {
      currentNumber += currentChar;

      if (index === 0) {
        this.firstCurrentNumberPosition = 0;
      }
    } else if (currentChar != ".") {
      this.firstCurrentNumberPosition = index + 1;
      break;
    }
  }

  this.currentNumber = [...currentNumber.replace(",", ".")].reverse().join("");
};

AppCore.prototype.validateNumbersInsertion = function (expression, number) {
  const lastChar = expression[expression.length - 1];

  if (
    lastChar != ")" &&
    lastChar != "!" &&
    lastChar != "π" &&
    lastChar != "e" &&
    (number != "," || (expression.length >= 1 && !isNaN(Number(lastChar))))
  ) {
    if (!lastChar || lastChar.replace(/[aA-zZ]/g, "")) {
      return true;
    }
  }

  return false;
};

AppCore.prototype.validateOperatorsInsertion = function (
  expression,
  lastChar,
  operator
) {
  if (
    (lastChar != "√" &&
      lastChar != "(" &&
      !this.isNotCalculable &&
      expression.indexOf("Bin(") === -1 &&
      expression.indexOf("Oct(") === -1 &&
      expression.indexOf("Hex(") === -1 &&
      expression.indexOf("Fib(") === -1 &&
      ((lastChar && lastChar.replace(/[aA-zZ]/g, "")) ||
        lastChar == "^" ||
        lastChar == "x")) ||
    (operator == "-" && lastChar == "(") ||
    (operator == "-" && !expression) ||
    lastChar == "e"
  ) {
    const penultimateChar = expression[expression.length - 2];

    if (
      expression.indexOf("Fib(") !== -1 ||
      (expression.indexOf("Log(") !== -1 &&
        expression.indexOf("Log(") + 4 === expression.length) ||
      (expression.indexOf("Ln(") !== -1 &&
        expression.indexOf("Ln(") + 3 === expression.length)
    ) {
      return false;
    }

    if (
      penultimateChar &&
      (penultimateChar == "-" || penultimateChar == "(") &&
      (lastChar == "(" || lastChar == "-")
    ) {
      return false;
    }

    return true;
  }

  return false;
};

AppCore.prototype.validateCharactersInsertion = function (
  expression,
  lastChar,
  inputChar
) {
  const { openingCount, closingCount } = this.countParentheses(expression);
  const penultimateChar = expression[expression.length - 2];

  if (
    (openingCount > closingCount &&
      !isNaN(Number(lastChar)) &&
      inputChar != "(") ||
    (openingCount > closingCount && lastChar == ")" && inputChar == ")") ||
    (!lastChar && inputChar != "!" && inputChar != ")") ||
    (inputChar == "(" &&
      (lastChar == "n" ||
        lastChar == "s" ||
        lastChar == "t" ||
        lastChar == "g" ||
        lastChar == "b")) ||
    (lastChar == "(" && inputChar != "!" && inputChar != ")") ||
    (inputChar != "!" &&
      (lastChar == "+" ||
        (lastChar == "-" && penultimateChar != "(") ||
        lastChar == "*" ||
        lastChar == "/" ||
        lastChar == "%")) ||
    (lastChar == "-" &&
      penultimateChar == "(" &&
      (inputChar == "π" || inputChar == "e")) ||
    ((!isNaN(Number(lastChar)) || lastChar == ")") && inputChar == "!") ||
    (lastChar == "!" &&
      ((openingCount > closingCount && inputChar == ")") ||
        inputChar == "!")) ||
    (lastChar == "√" && inputChar != "!") ||
    ((lastChar == "π" || lastChar == "e") &&
      openingCount > closingCount &&
      inputChar == ")")
  ) {
    if (inputChar == ")" && this.operatorsExample.indexOf(lastChar) !== -1) {
      return false;
    }

    if (
      expression &&
      (inputChar == "Bin(" ||
        inputChar == "Oct(" ||
        inputChar == "Hex(" ||
        inputChar == "Fib(")
    ) {
      return false;
    }

    if (
      inputChar != ")" &&
      (expression.indexOf("Bin(") !== -1 ||
        expression.indexOf("Oct(") !== -1 ||
        expression.indexOf("Hex(") !== -1 ||
        expression.indexOf("Fib(") !== -1)
    ) {
      return false;
    }

    if (penultimateChar == "!" && lastChar == "!" && inputChar == "!") {
      return false;
    }

    if (this.isNotCalculable && inputChar == "!" && lastChar == ")") {
      return false;
    }

    return true;
  }

  return false;
};

AppCore.prototype.checkIfCommaCanBeAdded = function (expression, number) {
  const numbersArray = this.getNumbersArray(expression);
  const operators = this.getOperatorsArray(expression);
  const lastNumberPosition = numbersArray.length - 1;
  const lastNumber = numbersArray[lastNumberPosition];
  let currentMathFunction;

  if (this.handleSeparateCalculations) {
    const openingParenthesisIndex = expression.length - (lastNumber.length + 1);

    currentMathFunction = this.getCurrentMathFunction(
      openingParenthesisIndex,
      expression
    );
  }

  let commaCount;

  if (currentMathFunction == "Hypot") {
    commaCount = countCommas(lastNumber.replace(/\./g, ","));
  }

  if (
    ((commaCount === 3 ||
      (operators.length === 1 && commaCount === 2) ||
      (operators.length === 2 && commaCount === 1)) &&
      number == ",") ||
    (!commaCount && lastNumber.includes(".") && number == ",")
  ) {
    return false;
  }

  return true;
};

function countCommas(expression) {
  let commaCount = 0;

  for (let char in expression) {
    if (expression[char] == ",") {
      commaCount++;
    }
  }

  return commaCount;
}

AppCore.prototype.handleExpressions = function (expression) {
  if (isNaN(Number(expression))) {
    const numbersArray = this.getNumbersArray(expression);
    const lastChar = expression[expression.length - 1];
    const hasError = this.checkIfExpressionHasWritingErrors(
      expression,
      lastChar,
      numbersArray
    );

    if (hasError) {
      appInterface.setDefaultStylingClasses();
      this.isNotCalculable = true;
    } else {
      this.isNotCalculable = false;
      const isValidExpression = this.validateExpressions(
        lastChar,
        numbersArray
      );

      if (isValidExpression) {
        this.handleCalculationResult(expression);
      } else {
        this.expressionResult.textContent = "";
        appInterface.setDefaultStylingClasses();
      }
    }
  } else {
    this.expressionResult.textContent = "";
    appInterface.setDefaultStylingClasses();
  }
};

AppCore.prototype.checkIfExpressionHasWritingErrors = function (
  expression,
  lastChar,
  numbersArray
) {
  const lastNumber = numbersArray[numbersArray.length - 1];
  const currentOperator =
    this.expressionOperators[this.expressionOperators.length - 1];

  if (
    currentOperator == "/" &&
    lastNumber !== "" &&
    Number(lastNumber) === 0 &&
    lastChar != "!"
  ) {
    return true;
  } else if (expression.indexOf("(") !== -1) {
    let openingParenthesisIndex;

    for (let index = expression.length - 1; index >= 0; index--) {
      const currentChar = expression[index];

      if (currentChar == "(") {
        openingParenthesisIndex = index;
        break;
      }
    }

    const currentMathFunction = this.getCurrentMathFunction(
      openingParenthesisIndex,
      expression
    );

    if (
      (currentMathFunction == "Log" || currentMathFunction == "Ln") &&
      Number(lastNumber) === 0
    ) {
      return true;
    }

    if (lastNumber.includes("Fib(")) {
      const startIndex = lastNumber.indexOf("(") + 1;
      const fibonacciValue = lastNumber.slice(startIndex);

      if (Number(fibonacciValue) === 0) {
        return true;
      }
    }
  }

  return false;
};

AppCore.prototype.validateExpressions = function (lastChar, numbersArray) {
  if (
    (numbersArray.length === 2 &&
      !this.haveSeparateCalculations &&
      numbersArray[1] === "") ||
    (numbersArray.length === 2 &&
      this.haveSeparateCalculations &&
      !lastChar.replace(/[aA-zZ\(\-]/g, "") &&
      lastChar != "e") ||
    (numbersArray.length === 1 &&
      (numbersArray[0] === "" || numbersArray[0] === "-"))
  ) {
    return false;
  }

  return true;
};

AppCore.prototype.formatNumbers = function (expression, number = "") {
  if (expression && expression != "-") {
    if (this.currentNumber == "") {
      this.firstCurrentNumberPosition = this.expressionInput.value.length - 1;
      // We have to get first position of expressionInput.value variable because its
      // formatted, while expression isn't
    }

    this.currentNumber += number;

    if (
      this.currentNumber &&
      (!expression.includes(".") || !this.currentNumber.includes("."))
    ) {
      const formattedNumber = Number(this.currentNumber).toLocaleString(
        "pt-BR"
      );

      appInterface.addFormattedNumbersOnDisplay(formattedNumber);
    }
  }
};

AppCore.prototype.countParentheses = function (expression) {
  let openingCount = 0;
  let closingCount = 0;

  for (let char in expression) {
    if (expression[char] == "(") {
      openingCount++;
    } else if (expression[char] == ")") {
      closingCount++;
    }
  }

  return { openingCount, closingCount };
};

AppCore.prototype.handleSignRules = function (
  lastChar,
  expressionArray,
  operator
) {
  if (
    isNaN(Number(lastChar)) &&
    lastChar != ")" &&
    lastChar != "(" &&
    lastChar != "!" &&
    lastChar != "π" &&
    lastChar != "e"
  ) {
    expressionArray.pop();
    this.expressionOperators.pop();

    if (lastChar == "-" && operator == "-") {
      operator = "+";
    } else if (lastChar == "-" && operator == "+") {
      operator = "-";
    }
  }

  return operator;
};

AppCore.prototype.handleCalculationResult = function (expression) {
  const numbersArray = this.handleGettingNumbersArray(expression);

  if (!this.isNotCalculable) {
    let result = calculateResult(numbersArray, this.expressionOperators);

    if (
      !isNaN(result) ||
      expression.includes("Fib(") ||
      expression.includes("Hex(")
    ) {
      if (
        expression.indexOf("Bin(") === -1 &&
        expression.indexOf("Oct(") === -1 &&
        expression.indexOf("Hex(") === -1 &&
        expression.indexOf("Fib(") === -1
      ) {
        result = formatExpressionResult(result);
      }

      appInterface.showResult(result);
    } else {
      appInterface.setDefaultStylingClasses();
      this.isNotCalculable = true;
    }
  }
};

AppCore.prototype.handleGettingNumbersArray = function (expression) {
  if (this.haveSeparateCalculations) {
    expression = this.handleSeparateCalculations(expression);
  }

  let numbersArray = this.getNumbersArray(expression);
  return numbersArray;
};

AppCore.prototype.handleSeparateCalculations = function (expression) {
  let newExpression = expression.replace(/\π/g, Math.PI);

  if (newExpression.indexOf("e") !== -1) {
    const previousPosition = newExpression.indexOf("e") - 1;
    const previousChar = newExpression[previousPosition];

    if (previousChar != "H") {
      newExpression = newExpression.replace(/\e/g, Math.E);
    }
  }

  let openingParenthesisCount = 0;
  let closingParenthesisCount = 0;

  while (newExpression.indexOf("(") !== -1) {
    const firstOpeningParenthesisIndex = newExpression.indexOf("(");
    const currentMathFunction = this.getCurrentMathFunction(
      firstOpeningParenthesisIndex,
      newExpression
    );

    const startPosition = currentMathFunction
      ? firstOpeningParenthesisIndex - currentMathFunction.length
      : firstOpeningParenthesisIndex;
    let partOfExpression = newExpression.slice(startPosition);
    let expressionPartContent = newExpression.slice(
      Number(firstOpeningParenthesisIndex) + 1
    );

    let closingParenthesisIndex;

    for (
      let index = firstOpeningParenthesisIndex;
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
        Number(firstOpeningParenthesisIndex) + 1,
        closingParenthesisIndex
      );
    }

    if (expressionPartContent.indexOf("(") !== -1) {
      expressionPartContent = this.handleSeparateCalculations(
        expressionPartContent
      );
    }

    if (
      expressionPartContent.indexOf("√") !== -1 ||
      expressionPartContent.indexOf("!") !== -1
    ) {
      expressionPartContent = this.calculateUnaryMathOperators(
        expressionPartContent
      );
    }

    const operators = this.getOperatorsArray(expressionPartContent);

    if (!operators.length) {
      if (currentMathFunction) {
        if (
          currentMathFunction == "Bin" ||
          currentMathFunction == "Oct" ||
          currentMathFunction == "Hex"
        ) {
          const conversionResult = this.calculateNumberBaseConversions(
            currentMathFunction,
            expressionPartContent
          );

          newExpression = newExpression.replace(
            partOfExpression,
            conversionResult
          );
        } else {
          const result = this.calculateMathFunctions(
            currentMathFunction,
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
      const numbersArray = this.getNumbersArray(
        expressionPartContent,
        operators
      );
      let result = calculateResult(numbersArray, operators);

      if (currentMathFunction) {
        if (
          currentMathFunction == "Hypot" &&
          !expressionPartContent.includes(".")
        ) {
          result = this.calculateMathFunctions(
            currentMathFunction,
            result,
            operators
          );
        } else {
          result = this.calculateMathFunctions(currentMathFunction, result);
        }
      }

      newExpression = newExpression.replace(partOfExpression, result);
    }
  }

  if (newExpression.indexOf("√") !== -1 || newExpression.indexOf("!") !== -1) {
    const unaryOperatorIndex = newExpression.indexOf("√");
    let canCalculate = true;

    if (unaryOperatorIndex !== -1) {
      const nextIndex = unaryOperatorIndex + 1;
      const nextChar = newExpression[nextIndex];

      if (nextChar == "√") {
        for (let index = nextIndex; index < newExpression.length; index++) {
          const currentChar = newExpression[index];
          const previousChar = newExpression[index - 1];

          if (previousChar == "√" && currentChar == "-") {
            canCalculate = false;
          }
        }
      } else if (nextChar == "-") {
        canCalculate = false;
      }
    }

    if (canCalculate) {
      this.isNotCalculable = false;
      newExpression = this.calculateUnaryMathOperators(newExpression);
    } else {
      this.isNotCalculable = true;
    }
  }

  return newExpression;
};

AppCore.prototype.getCurrentMathFunction = function (
  openingParenthesisIndex,
  expression
) {
  let previousIndex = openingParenthesisIndex - 1;
  const previousChar = expression[previousIndex];

  let currentMathFunction = "";

  if (
    previousChar &&
    previousChar != "√" &&
    this.expressionOperators.indexOf(previousChar) === -1
  ) {
    for (let index = previousIndex; index >= 0; index--) {
      let currentChar = expression[index];

      if (
        this.operatorsExample.indexOf(currentChar.replace("^", "**")) !== -1 ||
        currentChar == "√"
      ) {
        break;
      }

      currentMathFunction += currentChar;
    }

    currentMathFunction = [...currentMathFunction].reverse().join("");
    return currentMathFunction;
  }
};

AppCore.prototype.calculateUnaryMathOperators = function (expression) {
  let newExpression = expression;

  while (
    newExpression.indexOf("√") !== -1 ||
    newExpression.indexOf("!") !== -1
  ) {
    if (newExpression.indexOf("√") !== -1) {
      const firstSquareRootIndex = newExpression.indexOf("√");
      const nextIndex = firstSquareRootIndex + 1;
      const nextChar = newExpression[nextIndex];

      let lastSquareRootIndex = firstSquareRootIndex;
      let matchString = "√";
      let squareRootNumber = "";
      let squareRootCount = 1;

      if (nextChar == "√") {
        for (let index = nextIndex; index < newExpression.length; index++) {
          const currentChar = newExpression[index];

          if (!isNaN(currentChar)) {
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
        const currentChar = newExpression[index];

        if (!isNaN(Number(currentChar)) || currentChar == ".") {
          squareRootNumber += currentChar;
          continue;
        }

        break;
      }

      let result;

      if (squareRootCount === 1) {
        result = Math.sqrt(squareRootNumber);
      } else {
        for (let index = squareRootCount; index > 0; index--) {
          if (result) {
            result = Math.sqrt(result);
            continue;
          }

          result = Math.sqrt(squareRootNumber);
        }
      }

      matchString += squareRootNumber;
      newExpression = newExpression.replace(matchString, result);
    }

    if (newExpression.indexOf("!") !== -1) {
      const exclamationIndex = newExpression.indexOf("!");
      const nextIndex = exclamationIndex + 1;
      const nextChar = newExpression[nextIndex];

      let decreaseValue = 1;
      let matchString = "!";

      if (nextChar == "!") {
        matchString += "!";
        decreaseValue = 2;
      }

      let factorialNumber = "";

      for (let index = exclamationIndex - 1; index >= 0; index--) {
        const currentChar = newExpression[index];
        const previousChar = newExpression[index - 1];

        if (
          !isNaN(Number(currentChar)) ||
          currentChar == "." ||
          (currentChar == "-" && (!previousChar || previousChar == "("))
        ) {
          factorialNumber += newExpression[index];
          continue;
        }

        break;
      }

      factorialNumber = Number([...factorialNumber].reverse().join(""));
      matchString = String(factorialNumber) + matchString;

      if (factorialNumber === 0) {
        newExpression = newExpression.replace(matchString, 1);
        return newExpression;
      } else if (!String(factorialNumber).includes(".")) {
        const startValue = Math.abs(factorialNumber);
        let result = factorialNumber;

        for (
          let index = startValue - decreaseValue;
          index >= 1;
          index -= decreaseValue
        ) {
          result *= index;
        }

        newExpression = newExpression.replace(matchString, result);
      } else {
        appInterface.setDefaultStylingClasses();
        this.isNotCalculable = true;
        break;
      }
    }
  }

  return newExpression;
};

AppCore.prototype.getOperatorsArray = function (expression) {
  const operators = [];

  for (let char in expression) {
    const currentChar = expression[char];
    const previousChar = expression[char - 1];

    if (
      !isNaN(Number(previousChar)) &&
      this.operatorsExample.indexOf(currentChar) !== -1
    ) {
      const nextChar = expression[Number(char) + 1];
      let operator = currentChar;

      if (nextChar == "*") {
        operator += "*";
      }

      operators.push(operator);
    }
  }

  return operators;
};

AppCore.prototype.calculateNumberBaseConversions = function (
  currentMode,
  valueToConvert
) {
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
};

AppCore.prototype.calculateMathFunctions = function (
  currentMode,
  value,
  operators = null
) {
  const resultMode = document.getElementById("measurement-unit");
  let calculationResult;

  if (
    resultMode.textContent.trim() == "GRAU" &&
    (currentMode == "Sin" || currentMode == "Cos" || currentMode == "Tan")
  ) {
    value *= Math.PI / 180;
  }

  if (
    String(value).includes("-") &&
    (currentMode == "Log" || currentMode == "Ln")
  ) {
    this.isNotCalculable = true;
    return;
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
      const commaCount = countCommas(String(value).replace(/\./g, ","));

      if (commaCount === 0) {
        calculationResult = Math.hypot(value);
      } else {
        const firstDotIndex = value.indexOf(".");
        let valueCharsArray = [...value];

        if (!operators) {
          if (commaCount === 1) {
            const numbers = value.split(".");
            calculationResult = Math.hypot(...numbers);
          } else {
            const separatorIndex = value.indexOf(".", firstDotIndex + 1);
            valueCharsArray.splice(separatorIndex, 1, ",");
            valueCharsArray = valueCharsArray.join("");

            const numbers = valueCharsArray.split(",");
            calculationResult = Math.hypot(...numbers);
          }
        } else {
          const firstOperatorIndex = value.indexOf(operators[0]);

          if (firstOperatorIndex < firstDotIndex) {
            valueCharsArray.splice(firstDotIndex, 1, ",");
            valueCharsArray = valueCharsArray.join("");

            const numbers = valueCharsArray.split(",");
            const numbersArray = this.getNumbersArray(numbers[0], operators);
            value = calculateResult(numbersArray, operators);

            calculationResult = Math.hypot(value, numbers[1]);
          } else {
            let separatorIndex = value.indexOf(".", firstDotIndex + 1);

            if (separatorIndex === -1) {
              separatorIndex = firstDotIndex;
            }

            valueCharsArray.splice(separatorIndex, 1, ",");
            valueCharsArray = valueCharsArray.join("");

            const numbers = valueCharsArray.split(",");
            const numbersArray = this.getNumbersArray(numbers[1], operators);
            value = calculateResult(numbersArray, operators);

            calculationResult = Math.hypot(numbers[0], value);
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

          result += `, ${String(nextNumber)}`;
          previousNumber = currentNumber;
          currentNumber = nextNumber;
        }
      }

      calculationResult = result;
      break;
  }

  return calculationResult;
};

AppCore.prototype.getNumbersArray = function (expression) {
  let { newExpression, addPositions } =
    extractNegativeSignsFromExpression(expression);
  let numbersArray = [newExpression];

  if (
    this.expressionInput.value.indexOf("Fib(") === -1 &&
    this.expressionInput.value.indexOf("Hex(") === -1
  ) {
    newExpression = newExpression.replace(/\*\*/g, "^");

    numbersArray = newExpression
      .replace(/[^0-9\+\-\*\/\^\%\.\,\π\e]/g, "")
      .replace(/[^0-9\.\,\π\e]/g, " ")
      .split(" ");
  }

  numbersArray = addNegativeSignsToNumbersArray(addPositions, numbersArray);
  return numbersArray;
};

function extractNegativeSignsFromExpression(expression) {
  const extractPositions = [];
  const addPositions = [];
  let newExpression = expression;

  if (newExpression.indexOf("-") !== -1) {
    for (let char in newExpression) {
      const currentChar = newExpression[char];
      const previousChar = newExpression[char - 1];
      let addPosition;

      if (
        currentChar == "-" &&
        (!previousChar || (previousChar != ")" && isNaN(Number(previousChar))))
      ) {
        addPosition = char;

        if (previousChar == "(" || previousChar == "√" || previousChar == "*") {
          let charToBeIgnored = 0;

          for (let index = char - 1; index >= 0; index--) {
            const currentChar = newExpression[index];
            const previousChar = newExpression[index - 1];

            if (
              (currentChar == "(" && previousChar == "(") ||
              (currentChar == "√" && previousChar == "√") ||
              (currentChar == "*" && previousChar == "*")
            ) {
              charToBeIgnored++;
            }
          }

          addPosition -= charToBeIgnored;
        }

        extractPositions.push(char);
        addPositions.push(addPosition);
      }
    }
  }

  if (extractPositions.length) {
    newExpression = [...newExpression];

    extractPositions.forEach((signal, index) => {
      newExpression.splice(signal - index, 1);
    });

    newExpression = newExpression.join("");
  }

  return { newExpression, addPositions };
}

function addNegativeSignsToNumbersArray(addPositions, numbersArray) {
  if (addPositions.length) {
    const expressionArray = [...numbersArray.join(" ")];

    addPositions.forEach((position) => {
      expressionArray.splice(position, 0, "-");
    });

    numbersArray = expressionArray.join("").split(" ");
  }

  return numbersArray;
}

function calculateResult(numbersArray, operators) {
  let result;

  numbersArray.forEach((number, index) => {
    if (index >= 1) {
      const currentOperator = operators[index - 1];
      let currentNumber = Number(number);
      result = Number(result);

      switch (currentOperator) {
        case "+":
          result += currentNumber;
          break;
        case "-":
          result -= currentNumber;
          break;
        case "*":
          if (number === "") {
            currentNumber = 1;
          }

          result *= currentNumber;
          break;
        case "**":
          if (number === "") {
            currentNumber = 1;
          }

          result **= currentNumber;
          break;
        case "/":
          if (number === "") {
            currentNumber = 1;
          }

          result /= currentNumber;
          break;
        case "%":
          if (number === "") {
            currentNumber = 100;
          }

          result = (currentNumber * result) / 100;
          break;
      }
    } else {
      result = number;
    }
  });

  return result;
}

function formatExpressionResult(result) {
  result = !String(result).includes(".")
    ? Number(result).toLocaleString("pt-BR")
    : Number(result).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 10,
      });

  return result;
}

AppCore.prototype.validateThemes = function (colorInputs) {
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
};
