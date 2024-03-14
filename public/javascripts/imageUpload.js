const dropArea = document.getElementsByClassName("image-drop-area")[0];
const imageFile = document.getElementsByClassName("image-file")[0];
const imageView = document.getElementsByClassName("image-preview")[0];

imageFile.addEventListener("change", uploadImage);

function uploadImage() {
  console.log("upload image");
  let imgLink = URL.createObjectURL(imageFile.files[0]);
  imageView.style.backgroundImage = `url(${imgLink})`;
  imageView.textContent = "";
  imageView.style.border = 0;
}
