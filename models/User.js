const mongoose = require("mongoose")
const Schema = mongoose.Schema

const UserSchema = new Schema({
	facebook: String,
	google: String,
	instagram: String,
	linkedin: String,

	email: {
		type: String,
		required: true
	},
	password: {
		type: String,
		required: true
	},
	date: {
		type: Date,
		default: Date.now
	},
	profile: {
		name: String,
		gender: String,
		location: String,
		picture: String
	}
})

module.exports = User = mongoose.model("users", UserSchema)
