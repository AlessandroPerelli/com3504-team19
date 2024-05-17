/**
 * @function formatDateTime
 * Function to format date-time strings
 * @param {dateTimeString} The string to format 
 * @returns The string in the correct format
 */
function formatDateTime(dateTimeString) {
  const date = new Date(dateTimeString);
  return date.toLocaleString();
}

/**
 * @function toggleExclusiveCheckboxes
 * Function to toggle checkboxes, ensuring only one is selected at a time
 * @param {clickedCheckbox} The box that has been clicked
 */
function toggleExclusiveCheckboxes(clickedCheckbox) {
  const checkboxes = document.querySelectorAll(".sunlight-option");

  checkboxes.forEach(function (checkbox) {
    if (checkbox !== clickedCheckbox) {
      checkbox.checked = false;
    }
  });
}

module.exports = { formatDateTime };
