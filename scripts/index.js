import AppInterface from "./interface.js";

const appInterface = new AppInterface();

const resultModeButton = document.querySelector("#result-mode");
const conversionModeButton = document.querySelector("#conversion-mode");
const insertButton = document.querySelector(
  ".conversion-container button:last-child"
);
const themeButton = document.querySelector(
  ".interface-actions-container button:first-child"
);
const optionsBoxButton = document.querySelector(
  ".interface-actions-container button:nth-child(2)"
);
const clearButton = document.querySelector(
  ".main-container button:nth-child(1)"
);
const deleteCharacterButton = document.querySelector(
  ".main-container button:nth-child(2)"
);
const devModeButton = document.querySelector(
  ".main-container button:nth-child(3)"
);
const historyModalButton = document.querySelector(
  ".options-box div button:first-child"
);
const shortcutsModalButton = document.querySelector(
  ".options-box div button:nth-child(2)"
);
const personalizationModalButton = document.querySelector(
  ".options-box div button:last-child"
);
const closeModalButton = document.querySelector(".modal-header button");
const clearColorsButton = document.querySelector(".actions button:first-child");
const visualizeThemeButton = document.querySelector(
  ".actions button:nth-child(2)"
);
const saveThemeButton = document.querySelector(".actions button:last-child");

const operatorButtons = document.querySelectorAll(".operator");
const numberButtons = document.querySelectorAll(".number");

document.body.addEventListener(
  "keydown",
  appInterface.handleKeyboardShortcuts.bind(appInterface)
);
resultModeButton.addEventListener("click", appInterface.toggleResultMode);
conversionModeButton.addEventListener(
  "click",
  appInterface.changeConversionMode.bind(appInterface)
);
insertButton.addEventListener("click", appInterface.addConversionModeOnInput);
themeButton.addEventListener(
  "click",
  appInterface.toggleTheme.bind(appInterface)
);
optionsBoxButton.addEventListener(
  "click",
  appInterface.handleOptionsBox.bind(appInterface)
);
clearButton.addEventListener(
  "click",
  appInterface.clearExpressions.bind(appInterface)
);
deleteCharacterButton.addEventListener(
  "click",
  appInterface.deleteLastCharacter.bind(appInterface)
);
devModeButton.addEventListener(
  "click",
  appInterface.toggleDevMode.bind(appInterface)
);

operatorButtons.forEach((button) => {
  button.addEventListener("click", function () {
    const operator = this.textContent.trim();

    appInterface.addOperatorsOnDisplay(operator);
  });
});

numberButtons.forEach((button) => {
  button.addEventListener("click", function () {
    let number = this.textContent.trim();

    if (number != "," && isNaN(Number(number))) {
      number += "(";
      number = [...number];
      number[0] = number[0].toUpperCase();
      number = number.join("");
    }

    appInterface.handleAddingNumbersOrCharacters(number);
  });
});

historyModalButton.addEventListener(
  "click",
  appInterface.handleHistoryAccess.bind(appInterface)
);
shortcutsModalButton.addEventListener(
  "click",
  appInterface.handleShortcutsAccess.bind(appInterface)
);
personalizationModalButton.addEventListener(
  "click",
  appInterface.handlePersonalizationAccess.bind(appInterface)
);
closeModalButton.addEventListener(
  "click",
  appInterface.handleModalState.bind(appInterface)
);
clearColorsButton.addEventListener(
  "click",
  appInterface.applyDefaultColorValue
);
visualizeThemeButton.addEventListener(
  "mousedown",
  appInterface.showPersonalizedThemePreview.bind(appInterface)
);
saveThemeButton.addEventListener(
  "click",
  appInterface.createPersonalizedTheme.bind(appInterface)
);

appInterface.initializeInterface();
