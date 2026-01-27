import express from "express"
import messageController from "../controller/message-controller.js"
import { authMiddleware } from "../middleware/auth-middleware.js"

export const userRouter = express.Router()

userRouter.use(authMiddleware)

// Load Message History 
userRouter.get('/api/room/:roomId/message', messageController.getHistoryMessage)