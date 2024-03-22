var express = require("express");
const users = require("../models/users");
var router = express.Router();
const bcrypt = require('bcrypt');

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.post('/users', (request, response) => {
  const user = new users({
    firstName : request.body.firstName,
    lastName : request.body.lastName,
    userName : request.body.userName,
    password : request.body.password,
    email : request.body.email
  });
  bcrypt.hash(user.password, 10, function (err, hash){
    if (err) {
      return next(err);
    }
    user.password = hash;
    user.save().then(data => {
      console.log('Successfully created a new User');
    }).catch(error => {
      // you can send an error code here
    })
  });
});

module.exports = router;
