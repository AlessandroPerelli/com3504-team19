var express = require("express");
var router = express.Router();
var plants = require("../controllers/plants");
var users = require("../models/users");
var multer = require("multer");
var bcrypt = require("bcrypt");
var path = require("path");
var session = require("express-session");

const categories = require("../public/javascripts/categories");
const {
  getCurrentDateTime,
  getPlantById,
} = require("../public/javascripts/script");

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images/");
  },
  filename: function (req, file, cb) {
    // Make the file name the date + the file name
    filename = Date.now() + "-" + file.originalname;
    cb(null, filename);
  },
});
let upload = multer({ storage: storage });

router.use(
  session({
    secret: "changeme",
    resave: false,
    saveUninitialized: false,
  })
);

/* GET home page. */
router.get("/", function (req, res, next) {
  res.redirect("/login");
});

router.get("/login", function (req, res, next) {
  res.render("login", {
    title: "Welcome to Plant Viewer",
    showSearch: false,
    showProfile: false,
  });
});

router.get("/main", function (req, res, next) {
  res.render("mainpage", {
    categoryData: categories,
    showSearch: true,
    showProfile: true,
  });
});

router.get("/addplant", function (req, res, next) {
  if (req.session.user) {
    res.render("addplant", {
      dateTime: getCurrentDateTime(),
      showSearch: false,
      showProfile: true,
    });
  } else {
    res.redirect("/login");
  }
});

router.get("/viewplant", function (req, res, next) {
  const plantId = req.query.id;
  const plantData = getPlantById(plantId, categories);

  if (plantData) {
    res.render("components/plant", { plant: plantData, layout: false });
  } else {
    res.status(404).send("Plant not found");
  }
});

router.get("/user", function (req, res, next) {
  if (req.session.user) {
    res.render("user", {
      user: req.session.user,
      showSearch: true,
      showProfile: true,
    });
  } else {
    res.redirect("/login");
  }
});

router.post("/add", upload.single("img"), function (req, res, next) {
  let userData = req.body;
  let filePath = req.file.path;
  let result = plants.create(userData, filePath);
  console.log(result);
  res.redirect("/main");
});

router.post("/adduser", function (req, res) {
  // Check if passwords match
  if (req.body.password !== req.body.confirmpassword) {
    return res.status(400).send("Passwords do not match");
  }

  // Hash the password
  bcrypt.hash(req.body.password, 10, function (err, hash) {
    if (err) {
      return res.status(500).send("Error hashing password");
    }

    // Create a user instance
    const defaultAvatar = "/images/avatar.png";
    const user = new users({
      email: req.body.email,
      username: req.body.username,
      password: hash,
      avatar: defaultAvatar,
    });

    // Save the user to the database
    user
      .save()
      .then((data) => {
        console.log("Successfully created a new User");
        res.redirect("/main");
      })
      .catch((err) => {
        console.log(err);
      });
  });
});

router.post("/login", function (req, res, next) {
  const { identifier, password } = req.body;

  // Find user by email
  users
    .findOne({ $or: [{ email: identifier }, { username: identifier }] })
    .then((user) => {
      if (!user) {
        // User with the provided email does not exist
        return res.status(401).send("Invalid email/username or password");
      }

      // Compare password hashes
      bcrypt.compare(password, user.password, function (err, result) {
        if (result) {
          // Passwords match, user is authenticated
          req.session.user = user;
          res.redirect("/main");
        } else {
          // Passwords don't match
          res.status(401).send("Invalid email/username or password");
        }
      });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Internal server error");
    });
});

module.exports = router;
