// Function to format date-time strings
function formatDateTime(dateTimeString) {
  const date = new Date(dateTimeString);
  return date.toLocaleString();
}

// Function to toggle checkboxes, ensuring only one is selected at a time
function toggleExclusiveCheckboxes(clickedCheckbox) {
  const checkboxes = document.querySelectorAll(".sunlight-option");

  checkboxes.forEach(function (checkbox) {
    if (checkbox !== clickedCheckbox) {
      checkbox.checked = false;
    }
  });
}
module.exports = { formatDateTime };
