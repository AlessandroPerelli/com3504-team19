function formatDateTime(dateTimeString) {
  const date = new Date(dateTimeString);
  return date.toLocaleString();
}

module.exports = { formatDateTime };