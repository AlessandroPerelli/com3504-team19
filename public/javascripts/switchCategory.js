document.addEventListener("DOMContentLoaded", function () {

  const categoryButtons = document.querySelectorAll(".category-link");
  categoryButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const category = this.dataset.category;
      filterPlants(category);
    });
  });

  function filterPlants(category) {
    const plantItems = document.querySelectorAll(".plant-item");
    plantItems.forEach(function (item) {
      if (category === "all" || item.dataset.category === category) {
        item.style.display = "block";
      } else {
        item.style.display = "none";
      }
    });
  }

});
