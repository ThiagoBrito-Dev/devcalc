import AppInterface from "./interface.js";

const appInterface = new AppInterface();

appInterface.initialize();
document.body.onkeydown = (event) =>
  appInterface.handleKeyboardShortcuts(event);

// CALCULATOR HEADER EVENTS --------------------------------------------
const resultModeBtn = document.getElementById("result-mode");
resultModeBtn.onclick = appInterface.toggleResultMode;

const conversionModeBtn = document.getElementById("conversion-mode");
conversionModeBtn.onclick = () => appInterface.changeConversionMode();

const insertConversionBtn = document.getElementById("insert-conversion");
insertConversionBtn.onclick = () =>
  appInterface.handleAddingConversionModeOnInput();

const switchThemeBtn = document.getElementById("switch-theme");
switchThemeBtn.onclick = () => appInterface.switchTheme();

// OPTIONS BOX EVENTS --------------------------------------------------
const openOptionsBoxBtn = document.getElementById("open-options-box");
openOptionsBoxBtn.onclick = () => appInterface.handleOptionsBox();

const openHistoryModalBtn = document.getElementById("open-history");
openHistoryModalBtn.onclick = () => appInterface.handleHistoryAccess();

const openShortcutsModalBtn = document.getElementById("open-shortcuts");
openShortcutsModalBtn.onclick = () => appInterface.handleShortcutsAccess();

const openPersonalizationModalBtn = document.getElementById(
  "open-personalization"
);
openPersonalizationModalBtn.onclick = () =>
  appInterface.handlePersonalizationAccess();

// CALCULATOR BODY BUTTONS EVENTS --------------------------------------
const clearExpressionBtn = document.getElementById("clear-expression");
clearExpressionBtn.onclick = () => appInterface.clearExpression();

const deleteLastCharBtn = document.getElementById("delete-last-char");
deleteLastCharBtn.onclick = () => appInterface.deleteLastCharacter();

const toggleDevModeBtn = document.getElementById("dev-mode");
toggleDevModeBtn.onclick = () => appInterface.toggleDevMode();

const buttons = document.querySelectorAll("button.expression-related");
buttons.forEach((button) => {
  button.onclick = function () {
    const char = button.hasAttribute("data-char")
      ? button.getAttribute("data-char")
      : button.textContent.trim();

    appInterface.handleInputData(char);
  };
});

const resultBtn = document.getElementById("focalize-result");
resultBtn.onclick = () => appInterface.focalizeResult();

// MODAL EVENTS --------------------------------------------------------
const closeModalBtn = document.querySelector("header#modal-header button");
closeModalBtn.onclick = () => appInterface.handleModalState();

const fakeColorInputs = document.querySelectorAll(
  ".inputs-container input[type='text']"
);
fakeColorInputs.forEach((input) => {
  input.onclick = appInterface.triggerColorInput;
});

const setColorsToDefaultBtn = document.getElementById("clear-colors");
setColorsToDefaultBtn.onclick = appInterface.applyDefaultColorValue;

const previewThemeBtn = document.getElementById("preview-theme");
previewThemeBtn.onmousedown = () => appInterface.showPersonalizedThemePreview();

const saveThemeBtn = document.getElementById("save-theme");
saveThemeBtn.onclick = () => appInterface.createPersonalizedTheme();
