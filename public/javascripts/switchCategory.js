document.addEventListener("DOMContentLoaded", function () {
  const categoryButtons = document.querySelectorAll(".category-link");
  categoryButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const category = this.dataset.category;
      filterPlants(category);
    });
  });

  function filterPlants(category) {
    const categories = document.querySelectorAll(".category");
    categories.forEach(function (categoryElement) {
      if (category === "all" || categoryElement.dataset.category === category) {
        categoryElement.style.display = "block";
      } else {
        categoryElement.style.display = "none";
      }
    });
  }
});
