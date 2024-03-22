// Import the db model
const plantModel = require('../models/plants');

////////////////// Functions need to be deleted and altered for plants
// Function to create new students
exports.create = function (userData, filePath) {
    // Create a new plant instance using the provided user data
    let plant = new plantModel({
        name: userData.name,
        time: userData.time,
        location: userData.location,
        size: userData.size,
        desc: userData.desc,
        categories: userData.categories,
        img: filePath,
    });

    // Save the plant to the database and handle success or failure
    return plant.save().then(plant => {
        // Log the created plant
        console.log(plant);

        // Return the plant data as a JSON string
        return JSON.stringify(plant);
    }).catch(err => {
        // Log the error if saving fails
        console.log(err);

        // Return null in case of an error
        return null;
    });
};

// Function to get all students
exports.getAll = function () {
    // Retrieve all Plants from the database
    return plantModel.find({}).then(plants => {
        // Return the list of plants as a JSON string
        return JSON.stringify(plants);
    }).catch(err => {
        // Log the error if retrieval fails
        console.log(err);

        // Return null in case of an error
        return null;
    });
};