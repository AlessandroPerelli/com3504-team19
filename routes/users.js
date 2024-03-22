var express = require("express");
const users = require("../models/users");
var router = express.Router();
const bcrypt = require('bcrypt');

/* GET users listing. */
// router.get("/", function (req, res, next) {
//   res.send("respond with a resource");
// });

router.get('/',function(req,res){
  res.sendFile(path.join(__dirname+'/views/components/signupform'));
});

router.post('/users', (request, response) => {
  const user = new users({
    password : request.body.password,
    passwordconfirm: request.body.passwordconfirm,
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
