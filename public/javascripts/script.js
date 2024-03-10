function handleCredentialsFormSwitch() {
  document.getElementById('loginButton').addEventListener('click', function() {
    document.getElementById('loginButton').classList.add('active');
    document.getElementById('signupButton').classList.remove('active');
  });

  document.getElementById('signupButton').addEventListener('click', function() {
    document.getElementById('signupButton').classList.add('active');
    document.getElementById('loginButton').classList.remove('active');
  });
}