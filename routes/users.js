var express = require("express");
var router = express.Router();

/* GET users listing. */

router.get('/',function(req,res){
  res.sendFile(path.join(__dirname+'/views/components/signupform'));
});

module.exports = router;
