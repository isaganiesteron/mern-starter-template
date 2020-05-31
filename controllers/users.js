const User = require("../models/User")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const keys = require("../config/config")
const passwordValidator = require('password-validator')
const passSchema = new passwordValidator()

passSchema.is().min(8).is().max(20).has().digits()


const Validator = require("validator");
const isEmpty = require("is-empty");

const validateRegisterInput = require("../validation/register")
const validateLoginInput = require("../validation/login")


exports.register = (req, res) => {
    const { errors, isValid } = validateRegisterInput(req.body)

    if (!isValid) {
        return res.status(400).json(errors)
    }

    User.findOne({ email: req.body.email }).then(user => {
        if (user) {
            return res.status(400).json({ email: "Email already exists" })
        } else {
            const newUser = new User({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password
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
    // Form validation

    const { errors, isValid } = validateLoginInput(req.body)

    // Check validation
    if (!isValid) {
        return res.status(400).json(errors)
    }

    const email = req.body.email
    const password = req.body.password

    // Find user by email
    User.findOne({ email }).then(user => {
        // Check if user exists
        if (!user) {
            return res.status(404).json({ emailnotfound: "Email not found" })
        }

        // Check password
        bcrypt.compare(password, user.password).then(isMatch => {
            if (isMatch) {
                // User matched
                // Create JWT Payload
                const payload = {
                    id: user.id,
                    name: user.name
                }

                // Sign token
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
                return res
                    .status(400)
                    .json({ passwordincorrect: "Password incorrect" })
            }
        })
    })
}

exports.updateProfile = (req, res) => {
    // const validationErrors = []
    // if (!validator.isEmail(req.body.email)) validationErrors.push({ msg: 'Please enter a valid email address.' })

    // if (validationErrors.length)
    //     return res.status(400).json({ success: false, msg: 'Validation Errors', errors: validationErrors })

    // req.body.email = validator.normalizeEmail(req.body.email, { gmail_remove_dots: false })

    User.findById(req.user.id, (err, user) => {
        if (err) { return res.status(400).json({ success: false, msg: err }) }
        if (user.email !== req.body.email) user.emailVerified = false
        user.email = req.body.email || ''
        user.profile.name = req.body.name || ''
        user.profile.gender = req.body.gender || ''
        user.profile.location = req.body.location || ''
        user.save((err) => {
            if (err) {
                if (err.code === 11000)
                    return res.status(400).json({ success: false, msg: "The email address you have entered is already associated with an account." })
                return res.status(400).json({ success: false, msg: err })
            }
            return res.status(200).json({ success: true, msg: 'Profile has been updated.' })
        })
    })
}

exports.getAccount = (req, res) => {
    //do stuff with user information
    res.status(200).json({ success: true, msg: 'You have access your account.', data: {} })
}