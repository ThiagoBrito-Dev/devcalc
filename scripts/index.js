import AppInterface from "./interface.js";

const appInterface = new AppInterface();

appInterface.initialize();
document.body.onkeydown = (event) =>
  appInterface.handleKeyboardShortcuts(event);

// CALCULATOR HEADER EVENTS --------------------------------------------
const resultModeBtn = document.getElementById("result-mode");
resultModeBtn.onclick = appInterface.toggleResultMode;

const conversionModeBtn = document.getElementById("conversion-mode");
conversionModeBtn.onclick = () => appInterface.changeNumberBaseConversion();

const insertConversionBtn = document.getElementById("insert-conversion");
insertConversionBtn.onclick = () =>
  appInterface.handleAddingNumberBaseConversionOnInput();

const switchThemeBtn = document.getElementById("switch-theme");
switchThemeBtn.onclick = () => appInterface.changeTheme();

// OPTIONS BOX EVENTS --------------------------------------------------
const openOptionsBoxBtn = document.getElementById("open-options-box");
openOptionsBoxBtn.onclick = () => appInterface.handleOptionsBoxState();

const openHistoryModalBtn = document.getElementById("open-history");
openHistoryModalBtn.onclick = () => appInterface.handleAccessingHistoryModal();

const openShortcutsModalBtn = document.getElementById("open-shortcuts");
openShortcutsModalBtn.onclick = () =>
  appInterface.handleAccessingShortcutsModal();

const openPersonalizationModalBtn = document.getElementById(
  "open-personalization"
);
openPersonalizationModalBtn.onclick = () =>
  appInterface.handleAccessingPersonalizationModal();

// CALCULATOR BODY BUTTONS EVENTS --------------------------------------
const clearExpressionBtn = document.getElementById("clear-expression");
clearExpressionBtn.onclick = () => appInterface.handleDisplayCleaning();

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
  input.onkeydown = appInterface.triggerColorInput;
});

const setColorsToDefaultBtn = document.getElementById("clear-colors");
setColorsToDefaultBtn.onclick = appInterface.applyDefaultColorValue;

const previewThemeBtn = document.getElementById("preview-theme");
previewThemeBtn.onmousedown = (event) =>
  appInterface.showPersonalizedThemePreview(event);
previewThemeBtn.onkeydown = (event) =>
  appInterface.showPersonalizedThemePreview(event);

const saveThemeBtn = document.getElementById("save-theme");
saveThemeBtn.onclick = () => appInterface.createPersonalizedTheme();
