// Import the db model
const plantModel = require('../models/plants');

////////////////// Functions need to be deleted and altered for plants
// Function to create new students
exports.create = function (userData, filePath) {
    // Create a new plant instance using the provided user data
    let plant = new plantModel({
        plant_name: userData.plant_name,
        post_time: userData.post_time,
        sight_time: userData.sight_time,
        longitude: userData.longitude,
        latitude: userData.latitude,
        height: userData.height,
        spread: userData.spread,
        description: userData.description,
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