document.addEventListener("DOMContentLoaded", function () {
  const overlay = document.getElementById("overlay");
  const overlayContent = document.getElementById("overlay");

  // Add event listener to each plant item
  const plantItems = document.querySelectorAll(".plant-item");
  plantItems.forEach(function (item) {
    item.addEventListener("click", function () {
      const plantId = this.dataset.plantId;
      fetchPlantDetails(plantId);
    });
  });

  // Function to fetch plant details and display in the overlay
  function fetchPlantDetails(plantId) {
    // Make an AJAX request to fetch the plant component
    fetch(`/viewplant?id=${plantId}`)
      .then((response) => response.text())
      .then((data) => {
        console.log(plantId)
        console.log(data)
        overlayContent.querySelector(".overlay-content-view").innerHTML = data;
        overlay.style.display = "block";
      })
      .catch((error) => {
        console.error("Error fetching plant details:", error);
      });
  }

  // Add event listener to close the overlay when clicking outside the content
  overlay.addEventListener("click", function (event) {
    if (event.target === overlay) {
      overlay.style.display = "none";
    }
  });
});
