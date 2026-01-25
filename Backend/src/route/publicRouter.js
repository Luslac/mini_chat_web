import express from "express"
import userController from "../controller/user-controller.js"

export const publicRouter = express.Router()

publicRouter.post('/api/registration', userController.registration)
publicRouter.post('/api/login', userController.login)