document.addEventListener("DOMContentLoaded", function () {
  const avatarUpload = document.getElementById("avatar-upload");
  const avatarImage = document.querySelector(".profile-picture img");

  avatarUpload.addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        avatarImage.src = e.target.result;
        uploadImage(file);
      };
      reader.readAsDataURL(file);
    }
  });
});
