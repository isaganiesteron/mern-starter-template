const express = require("express")
const mongoose = require("mongoose")
const bodyParser = require("body-parser")
const passport = require("passport")
const app = express()
const config = require("./config/config")
const helmet = require('helmet')
const expressValidator = require('express-validator')


/**
 * Controllers
 */
userController = require('./controllers/users')

/**
 * MongoDB
 */
mongoose.connect(config.mongoURI, { useNewUrlParser: true })
    .then(() => console.log("MongoDB successfully connected"))
    .catch(err => console.log(err))


/**
 * Middlewares
 */
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(helmet())
// app.use(expressValidator())


/**
 * Passport
 */
app.use(passport.initialize())
require("./config/passport")(passport)

/**
 * User Account Routes
 */
app.post('/register', userController.register)
app.post('/login', userController.login)
// app.get('/logout', userController.logout)
app.post('/updateProfile', passport.authenticate('jwt', { session: false }), userController.updateProfile)
app.get('/account', passport.authenticate('jwt', { session: false }), userController.getAccount)

/**
 * Express Server
 */
app.listen(config.port, () => { console.log("MERN Starter Server running on port " + config.port) })