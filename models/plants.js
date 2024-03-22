let mongoose = require('mongoose');

// Get the Schema class from mongoose
let Schema = mongoose.Schema;

// Define the schema for the Plant model
let PlantSchema = new Schema(
    {
        // Define the first_name field with type String, required,
        // and max length of 100 characters
        first_name: { type: String, required: true, max: 100 },
        // Define the last_name field with type String, required,
        // and max length of 100 characters
        last_name: { type: String, required: true, max: 100 },
        // Define the dob (date of birth) field with type Date
        dob: { type: Date },
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