const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
	username: {
		type: String,
		require: [true, "User must have a username"],
	},
	password: {
		type: String,
		require: [true, "User must have a password"],
		unique: true,
	},
})

const User = mongoose.model("User", userSchema)

module.exports = User;