const dropArea = document.getElementsByClassName("image-drop-area")[0];
const imageFile = document.getElementsByClassName("image-file")[0];
const imageContainer = document.getElementsByClassName("image-container")[0];

imageFile.addEventListener("change", uploadImage);

function uploadImage() {
  console.log("upload image");
  console.log(imageFile.files[0]);
  let imgLink = URL.createObjectURL(imageFile.files[0]);
  imageContainer.style.backgroundImage = `url(${imgLink})`;
  imageContainer.textContent = "";
  imageContainer.style.border = 0;
}
