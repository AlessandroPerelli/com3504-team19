let mongoose = require('mongoose');

// Get the Schema class from mongoose
let Schema = mongoose.Schema;

//     name: userData.name,
//     time: userData.time,
//     location: userData.location,
//     size: userData.size,
//     desc: userData.desc,
//     categories: userData.categories,
//     img: filePath,

// Define the schema for the Plant model
let PlantSchema = new Schema(
    {
        // Define the name
        name: { type: String, required: true },
        time: { type: Date },
        // Define location as two values Lat and Long
        location: {
            type: {
                Latitude: Number,
                Longitude: Number }},
        // size of plant
        size: { type: Number},
        // description of plant
        desc: { type: String},
        // categories should probably be from a select list
        // so use an array of those options
        categories: { type: Array },
        // Define the img field with type String
        img: {type: String }
    }
);

// Configure the 'toObject' option for the schema to include getters
// and virtuals when converting to an object
PlantSchema.set('toObject', { getters: true, virtuals: true });

// Create the mongoose model 'Plant' based on the defined schema
let Plants = mongoose.model('plant', PlantSchema);

// Export the Student model for use in other modules
module.exports = Plants;