import AppInterface from "./interface.js";

const appInterface = new AppInterface();

appInterface.initialize();
document.body.onkeydown = (event) =>
  appInterface.handleKeyboardShortcuts(event);

// CALCULATOR HEADER EVENTS --------------------------------------------
const btnMeasurementUnit = document.getElementById("measurement-unit");
btnMeasurementUnit.onclick = appInterface.toggleResultMode;

const btnConversionType = document.getElementById("conversion-type");
btnConversionType.onclick = () => appInterface.changeNumberBaseConversionType();

const btnInsertConversion = document.getElementById("insert-conversion");
btnInsertConversion.onclick = () =>
  appInterface.handleAddingNumberBaseConversionOnInput();

const btnChangeTheme = document.getElementById("change-theme");
btnChangeTheme.onclick = () => appInterface.changeTheme();

// OPTIONS BOX EVENTS --------------------------------------------------
const btnOpenOptionsBox = document.getElementById("open-options-box");
btnOpenOptionsBox.onclick = (event) =>
  appInterface.handleOptionsBoxState(event);

const btnOpenHistoryModal = document.getElementById("open-history");
btnOpenHistoryModal.onclick = () => appInterface.handleAccessingHistoryModal();

const btnOpenShortcutsModal = document.getElementById("open-shortcuts");
btnOpenShortcutsModal.onclick = () =>
  appInterface.handleAccessingShortcutsModal();

const btnOpenPersonalizationModal = document.getElementById(
  "open-personalization"
);
btnOpenPersonalizationModal.onclick = () =>
  appInterface.handleAccessingPersonalizationModal();

// CALCULATOR BODY BUTTONS EVENTS --------------------------------------
const btnClearExpression = document.getElementById("clear-expression");
btnClearExpression.onclick = () => appInterface.handleDisplayCleaning();

const btnDeleteLastChar = document.getElementById("delete-last-char");
btnDeleteLastChar.onclick = () => appInterface.deleteLastCharacter();

const btnToggleDevMode = document.getElementById("dev-mode");
btnToggleDevMode.onclick = () => appInterface.toggleDevMode();

const buttons = document.querySelectorAll("button.expression-related");
buttons.forEach((button) => {
  button.onclick = function () {
    const char = button.hasAttribute("data-char")
      ? button.getAttribute("data-char")
      : button.textContent.trim();

    appInterface.handleInputData(char);
  };
});

const btnFocalizeResult = document.getElementById("focalize-result");
btnFocalizeResult.onclick = () => appInterface.focalizeResult();

// MODAL EVENTS --------------------------------------------------------
const btnCloseModal = document.querySelector(
  "header#modal-header button.close-modal"
);
btnCloseModal.onclick = () => appInterface.handleModalState();

const fakeColorInputs = document.querySelectorAll(
  "div.inputs-container input[type='text']"
);
fakeColorInputs.forEach((input) => {
  input.onclick = appInterface.triggerColorInput;
  input.onkeydown = appInterface.triggerColorInput;
});

const btnClearColors = document.getElementById("clear-colors");
btnClearColors.onclick = appInterface.applyDefaultColorValue;

const btnPreviewTheme = document.getElementById("preview-theme");

if (window.innerWidth <= 768) {
  btnPreviewTheme.onclick = (event) =>
    appInterface.showPersonalizedThemePreview(event, true);
} else {
  btnPreviewTheme.onmousedown = (event) =>
    appInterface.showPersonalizedThemePreview(event);
  btnPreviewTheme.onkeydown = (event) =>
    appInterface.showPersonalizedThemePreview(event);
}

const btnSaveTheme = document.getElementById("save-theme");
btnSaveTheme.onclick = () => appInterface.createPersonalizedTheme();
