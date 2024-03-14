const dropArea = document.getElementById("image-drop-area");
const imageFile = document.getElementById("image-file");
const imageView = document.getElementById("image-preview");

imageFile.addEventListener("change", uploadImage);

function uploadImage() {
  let imgLink = URL.createObjectURL(imageFile.files[0]);
  imageView.style.backgroundImage = `url(${imgLink})`;
  imageView.textContent = "";
  imageView.style.border = 0;
}
