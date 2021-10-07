import AppInterface from "./interface.js";

let appInterface;

export default class AppCore {
  constructor() {
    this.expressionInput = document.querySelector("div.display input");
    this.expressionResult = document.querySelector("div.result-container p");

    this.isNotCalculable = false;
    this.haveSeparateCalculations = false;

    this.expressionOperators = [];
    this.currentNumber = "";
    this.firstPosition;
  }

  handleValidThemes(colorInputs) {
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

  checkIfCommaCanBeAdded(expression, number) {
    const numbersArray = this.getNumbersArray(expression);

    if (numbersArray) {
      const lastNumberPosition = numbersArray.length - 1;
      const lastNumber = numbersArray[lastNumberPosition];
      const operators = this.getOperatorsArray(expression);
      let commaCount;

      if (lastNumber.indexOf("Hypot(") !== -1) {
        commaCount = this.countCommas(lastNumber);
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

  countCommas(expression) {
    let commaCount = 0;

    for (let char in expression) {
      if (expression[char] == ",") {
        commaCount++;
      }
    }

    return commaCount;
  }

  handleValidExpressions(expression, number) {
    const numbersArray = this.getNumbersArray(expression);

    if (numbersArray) {
      const lastNumberPosition = numbersArray.length - 1;
      const lastOperatorPosition = this.expressionOperators.length - 1;
      const lastNumber = numbersArray[lastNumberPosition].replace(",", ".");
      const currentOperator = this.expressionOperators[lastOperatorPosition];
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
          this.expressionOperators.indexOf(previousChar) != -1) ||
        lastNumber == "√(" ||
        lastNumber == "√"
      ) {
        appInterface.setDefaultStylingClasses();
        this.isNotCalculable = true;
      } else {
        this.isNotCalculable = false;
        this.triggerCalculation(expression, numbersArray);
      }
    }
  }

  formatNumbers(expression, number = "") {
    appInterface = new AppInterface();

    if (expression && expression != "-") {
      if (this.currentNumber == "") {
        this.firstPosition = this.expressionInput.value.indexOf(
          number,
          expression.length - 1
        );
      }

      this.currentNumber += number;

      if (
        this.currentNumber &&
        !isNaN(Number(this.currentNumber)) &&
        (!expression.includes(",") || !this.currentNumber.includes(","))
      ) {
        const formattedNumber = Number(this.currentNumber).toLocaleString(
          "pt-BR"
        );

        appInterface.addFormattedNumbersOnDisplay(formattedNumber);
      }
    }
  }

  handleSignRule(lastChar, expressionArray, operator) {
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
  }

  triggerCalculation(expression, numbersArray) {
    const expressionArray = [...expression];

    expression = expressionArray.join("");
    const isInvalidExpression = this.checkIfIsInvalidExpression(
      expression,
      numbersArray
    );

    this.handleCalculationResult(isInvalidExpression);
  }

  checkIfIsInvalidExpression(expression, numbersArray) {
    const lastOperatorPosition = this.expressionOperators.length - 1;
    const currentOperator = this.expressionOperators[lastOperatorPosition];
    let splittedExpression = expression.split(currentOperator);

    if (
      numbersArray.length == 2 &&
      !numbersArray[1] &&
      !splittedExpression[1]
    ) {
      return true;
    }

    return false;
  }

  handleCalculationResult(isInvalidExpression) {
    const lastOperatorPosition = this.expressionOperators.length - 1;
    const currentOperator = this.expressionOperators[lastOperatorPosition];
    let expression = this.expressionInput.value
      .replace(/\^/g, "**")
      .replace(/\x/g, "*")
      .replace(/\÷/g, "/");

    if (!isInvalidExpression) {
      if (
        expression.indexOf(currentOperator) !== -1 ||
        this.haveSeparateCalculations
      ) {
        expression = this.expressionInput.value
          .replace(/\./g, "")
          .replace(/\,/g, ".");

        const numbersArray = this.handleNumbersArray(expression);
        let result;

        for (let number in numbersArray) {
          result = this.calculateResult(
            numbersArray,
            number,
            this.expressionOperators,
            result
          );
        }

        if (
          expression.indexOf("Bin(") === -1 &&
          expression.indexOf("Oct(") === -1 &&
          expression.indexOf("Hex(") === -1 &&
          expression.indexOf("Fib(") === -1
        ) {
          result = this.formatExpressionResult(result);
        }

        appInterface.showResult(result);
      }
    } else {
      this.expressionResult.textContent = "";
      appInterface.setDefaultStylingClasses();
    }
  }

  calculateResult(numbersArray, number, operators, result) {
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

  formatExpressionResult(result) {
    const lastOperatorPosition = this.expressionOperators.length - 1;
    const currentOperator = this.expressionOperators[lastOperatorPosition];

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

  handleNumbersArray(expression) {
    if (this.haveSeparateCalculations) {
      expression = this.handleSeparateCalculations(expression);
    }

    let firstCharIsAnOperator = false;
    let firstChar;

    if (expression && expression[0] == "-") {
      expression = expression.slice(1);
      firstCharIsAnOperator = true;
      firstChar = "-";
    }

    const numbersArray = this.getNumbersArray(expression);

    if (firstCharIsAnOperator) {
      numbersArray[0] = firstChar + numbersArray[0];
    }

    return numbersArray;
  }

  getNumbersArray(splittedExpression, operators = this.expressionOperators) {
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

    if (this.expressionInput.value.indexOf("Fib(") === -1) {
      numbersArray = splittedExpression.split(" ");
    }

    return numbersArray;
  }

  handleSeparateCalculations(expression) {
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
      const currentMode = this.getCurrentMode(
        openingParenthesisIndex,
        newExpression
      );

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
        if (currentMode) {
          if (
            currentMode == "Bin" ||
            currentMode == "Oct" ||
            currentMode == "Hex"
          ) {
            const conversionResult = this.calculateConversions(
              currentMode,
              expressionPartContent
            );

            newExpression = newExpression.replace(
              partOfExpression,
              conversionResult
            );
          } else {
            const result = this.calculateMathFunctions(
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
        const numbersArray = this.getNumbersArray(
          expressionPartContent,
          operators
        );
        let result;

        for (let number in numbersArray) {
          result = this.calculateResult(
            numbersArray,
            number,
            operators,
            result
          );
        }

        if (currentMode) {
          if (result) {
            result = this.calculateMathFunctions(
              currentMode,
              result,
              operators
            );
          } else if (currentMode == "Hypot") {
            result = this.calculateMathFunctions(
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

    if (
      newExpression.indexOf("√") !== -1 ||
      newExpression.indexOf("!") !== -1
    ) {
      newExpression = this.calculateUnaryMathOperators(newExpression);
    }

    return newExpression;
  }

  calculateMathFunctions(currentMode, value, operators = null) {
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
        const commaCount = this.countCommas(value.replace(/\./g, ","));

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
              const numbersArray = this.getNumbersArray(numbers[0], operators);
              let result;

              for (let number in numbersArray) {
                result = this.calculateResult(
                  numbersArray,
                  number,
                  operators,
                  result
                );
              }

              calculationResult = Math.hypot(result, numbers[1]);
            } else {
              const separatorIndex = value.indexOf(".", firstDotIndex + 1);
              value.splice(separatorIndex, 1, ",");

              const numbers = value.join("").split(",");
              const numbersArray = this.getNumbersArray(numbers[1], operators);
              let result;

              for (let number in numbersArray) {
                result = this.calculateResult(
                  numbersArray,
                  number,
                  operators,
                  result
                );
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

  calculateConversions(currentMode, valueToConvert) {
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

  calculateUnaryMathOperators(expression) {
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

  getCurrentMode(openingParenthesisIndex, expression) {
    let previousIndex = openingParenthesisIndex - 1;
    const previousChar = expression[previousIndex];
    let currentMode = "";

    if (
      previousChar != "(" &&
      this.expressionOperators.indexOf(previousChar) === -1
    ) {
      for (let index = previousIndex; index > -1; index--) {
        let currentChar = expression[index]
          .replace("^", "**")
          .replace("÷", "/");

        if (currentChar == "x" && !isNaN(Number(expression[index - 1]))) {
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

  countParentheses(expression, getClosingIndex = false) {
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

  getOperatorsArray(expression) {
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

  getNewCurrentNumberValue(expression) {
    this.currentNumber = "";

    for (let char in expression) {
      if (expression[char] !== "." && char >= this.firstPosition) {
        this.currentNumber += expression[char];
      }
    }
  }
}
