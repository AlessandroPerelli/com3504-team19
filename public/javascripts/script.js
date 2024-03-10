function handleCredentialsFormSwitch() {
  document.getElementById('loginButton').addEventListener('click', function() {
    document.getElementById('loginForm').classList.add('active');
    document.getElementById('signupForm').classList.remove('active');
  });

  document.getElementById('signupButton').addEventListener('click', function() {
    document.getElementById('signupForm').classList.add('active');
    document.getElementById('loginForm').classList.remove('active');
  });
}