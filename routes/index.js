var express = require('express');
var router = express.Router();
var plants = require('../controllers/plants')
var users = require('../models/users');
var multer = require('multer')
var bcrypt = require('bcrypt');

const categories = require('../public/javascripts/categories');
const {
  getCurrentDateTime,
  getPlantById,
} = require('../public/javascripts/script');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images/uploads/');
  },
  filename: function (req, file, cb) {
    // Make the file name the date + the file name
    filename =  Date.now() + '-' + file.originalname;
    cb(null, filename);
  }
});
let upload = multer({ storage: storage });

/* GET home page. */
router.get("/", function (req, res, next) {
  res.redirect("/login");
});

router.get("/login", function (req, res, next) {
  res.render("login", { title: "Welcome to Plant Viewer", showSearch: false, showProfile: false });
});

router.get("/main", function (req, res, next) {
  res.render("mainpage", { categoryData: categories, showSearch: true, showProfile: true });
});

router.get("/addplant", function (req, res, next) {
  res.render("addplant", { dateTime: getCurrentDateTime(), showSearch: false, showProfile: true});
});

router.get("/viewplant", function (req, res, next) {
  const plantId = req.query.id;
  const plantData = getPlantById(plantId, categories);

  if (plantData) {
    res.render("viewplant", { plant: plantData, showSearch: false, showProfile: true});
  } else {
    res.status(404).send("Plant not found");
  }
});

router.post('/add', upload.single('img'), function (req, res, next) {
  let userData = req.body;
  let filePath = req.file.path;
  let result = plants.create(userData, filePath);
  console.log(result);
  res.redirect('/main');
});

router.post('/adduser', function (req, res) {
  const user = new users({
    password : req.body.password,
    confirmpassword: req.body.confirmpassword,
    email : req.body.email
  });
  bcrypt.hash(user.password, 10, function (err, hash){
    user.password = hash;
    user.save().then(data => {
      console.log('Successfully created a new User');
    }).catch(err => {
      console.log(err);
    })
  });
  res.redirect('/main');
});

router.post('/login', function(req, res, next) {
  const { email, password } = req.body;

  // Find user by email
  users.findOne({ email })
      .then(user => {
        if (!user) {
          // User with the provided email does not exist
          return res.status(401).send('Invalid email or password');
        }

        // Compare password hashes
        bcrypt.compare(password, user.password, function(err, result) {
          if (result) {
            // Passwords match, user is authenticated
            res.redirect('/main');
          } else {
            // Passwords don't match
            res.status(401).send('Invalid email or password');
          }
        });
      })
      .catch(err => {
        console.error(err);
        res.status(500).send('Internal server error');
      });
});

module.exports = router;
