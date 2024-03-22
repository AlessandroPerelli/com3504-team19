var express = require("express");
var router = express.Router();
var plants = require('../controllers/database')
var multer = require('multer')

const categories = require("../public/javascripts/categories");
const {
  getCurrentDateTime,
  getPlantById,
} = require("../public/javascripts/script");

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images/uploads/');
  },
  filename: function (req, file, cb) {
    var original = file.originalname;
    var file_extension = original.split(".");
    // Make the file name the date + the file extension
    filename =  Date.now() + '.' + file_extension[file_extension.length-1];
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

module.exports = router;
