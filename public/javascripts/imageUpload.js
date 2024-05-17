/**
 * Shows the image preview in addplant.ejs
 */
document
  .getElementById("imageFile")
  .addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const img = document.getElementById("imagePreview");
        img.src = e.target.result;
        img.style.display = "block";

        const label = document.querySelector(".image-label");
        label.style.display = "none";
      };
      reader.readAsDataURL(file);
    }
  });
