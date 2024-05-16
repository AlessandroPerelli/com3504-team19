document.addEventListener("DOMContentLoaded", function () {
  const overlay = document.getElementById("overlay");
  const overlayContent = document.getElementById("overlay");

  // Add event listener to each plant item
  const plantItems = document.querySelectorAll(".plant-item");
  plantItems.forEach(function (item) {
    item.addEventListener("click", function () {
      const plantId = this.dataset.plantId;
      fetchPlantDetails(plantId);
      init(plantId);
    });
  });

  // Function to fetch plant details and display in the overlay
  function fetchPlantDetails(plantId) {
    // Add a cache-busting parameter (timestamp)
    const url = `/viewplant?id=${plantId}&_=${new Date().getTime()}`;

    // Make an AJAX request to fetch the plant component
    fetch(url)
      .then((response) => response.text())
      .then((data) => {
        console.log(plantId);
        console.log(data);
        overlayContent.querySelector(".overlay-content-view").innerHTML = data;
        overlay.style.display = "block";
        var overlayShownEvent = new Event("overlayShown");
        overlay.dispatchEvent(overlayShownEvent);
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
