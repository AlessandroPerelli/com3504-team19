function handleCredentialsFormSwitch() {
  document.getElementById("loginButton").addEventListener("click", function () {
    document.getElementById("loginButton").classList.add("active");
    document.getElementById("signupButton").classList.remove("active");
    var loginForm = document.getElementById("loginForm");
    var signupForm = document.getElementById("signupForm");
    loginForm.style.display = "block";
    signupForm.style.display = "none";
  });

  document
    .getElementById("signupButton")
    .addEventListener("click", function () {
      document.getElementById("signupButton").classList.add("active");
      document.getElementById("loginButton").classList.remove("active");
      var loginForm = document.getElementById("loginForm");
      var signupForm = document.getElementById("signupForm");
      loginForm.style.display = "none";
      signupForm.style.display = "block";
    });
}

function getPlantById(plantId, categories) {
  for (let category of categories) {
    for (let plant of category.plants) {
      if (plant.id === parseInt(plantId, 10)) {
        return plant;
      }
    }
  }
  return null;
}

module.exports = {
  handleCredentialsFormSwitch,
  getPlantById,
};
