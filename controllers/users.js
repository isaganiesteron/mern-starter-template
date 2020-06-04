const User = require("../models/User")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const keys = require("../config/config")
const validation = require("./validation")

exports.register = (req, res) => {
	const { errors, isValid } = validation.registration(req.body)
	if (!isValid) return res.status(400).json(errors)

	User.findOne({ email: req.body.email }).then(user => {
		if (user) {
			return res.status(400).json({ email: "Email already exists" })
		} else {
			const newUser = new User({
				email: req.body.email,
				password: req.body.password,
				profile: { name: req.body.name },
				reviews: []
			})

			// Hash password before saving in database
			bcrypt.genSalt(10, (err, salt) => {
				bcrypt.hash(newUser.password, salt, (err, hash) => {
					if (err) throw err
					newUser.password = hash
					newUser
						.save()
						.then(user => res.json(user))
						.catch(err => console.log(err))
				})
			})
		}
	})
}

exports.login = (req, res) => {
	const { errors, isValid } = validation.login(req.body)
	if (!isValid) return res.status(400).json(errors)

	const email = req.body.email
	const password = req.body.password

	User.findOne({ email }).then(user => {
		if (!user)
			return res.status(404).json({ emailnotfound: "Email not found" })

		bcrypt.compare(password, user.password).then(isMatch => {
			if (isMatch) {
				// User matched
				// Create JWT Payload
				const payload = {
					id: user.id,
					name: user.name
				}

				jwt.sign(
					payload,
					keys.secretOrKey,
					{ expiresIn: 31556926 }, // 1 year in seconds
					(err, token) => {
						res.json({
							success: true,
							token: "Bearer " + token
						})
					}
				)
			} else {
				return res.status(400).json({ passwordincorrect: "Password incorrect" })
			}
		})
	})
}

exports.updateProfile = (req, res) => {
	const { errors, isValid, cleanEmail } = validation.email(req.body)
	if (!isValid) return res.status(400).json(errors)

	req.body.email = cleanEmail

	User.findById(req.user.id, (err, user) => {
		if (err) { return res.status(400).json({ error: err }) }
		if (user.email !== req.body.email) user.emailVerified = false
		user.email = req.body.email || ''
		user.profile.name = req.body.name || ''
		user.profile.gender = req.body.gender || ''
		user.profile.location = req.body.location || ''
		user.save((err) => {
			if (err) {
				if (err.code === 11000)
					return res.status(400).json({ email: "The email address you have entered is already associated with an account." })
				return res.status(400).json({ error: err })
			}
			return res.json({
				success: true,
				user: { profile: user.profile, email: user.email, _id: user._id }
			})
		})
	})
}

exports.getAccount = (req, res) => {
	//do stuff with user information
	res.status(200).json({ success: true, user: { profile: req.user.profile, email: req.user.email, _id: req.user._id } })
}