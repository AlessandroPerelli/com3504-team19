// Import the db model
const studentModel = require('../models/database');



////////////////// Functions need to be deleted and altered for plants
// Function to create new students
exports.create = function (userData, filePath) {
    // Create a new student instance using the provided user data
    let student = new studentModel({
        first_name: userData.first_name,
        last_name: userData.last_name,
        dob: userData.dob,
        img: filePath,
    });

    // Save the student to the database and handle success or failure
    return student.save().then(student => {
        // Log the created student
        console.log(student);

        // Return the student data as a JSON string
        return JSON.stringify(student);
    }).catch(err => {
        // Log the error if saving fails
        console.log(err);

        // Return null in case of an error
        return null;
    });
};

// Function to get all students
exports.getAll = function () {
    // Retrieve all students from the database
    return studentModel.find({}).then(students => {
        // Return the list of students as a JSON string
        return JSON.stringify(students);
    }).catch(err => {
        // Log the error if retrieval fails
        console.log(err);

        // Return null in case of an error
        return null;
    });
};

