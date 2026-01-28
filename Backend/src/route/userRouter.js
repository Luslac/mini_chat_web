import express from "express"
import messageController from "../controller/message-controller.js"
import { authMiddleware } from "../middleware/auth-middleware.js"
import userController from "../controller/user-controller.js"

export const userRouter = express.Router()

userRouter.use(authMiddleware)

// Load Message History 
userRouter.get('/api/room/:roomId/message', messageController.getHistoryMessage)

// Get friend list for socket that need friends id :0, dont forget to use query ma friend
userRouter.get('/api/users', userController.getFriend)