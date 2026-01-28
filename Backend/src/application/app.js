import express from "express";
import cors from "cors"
import http from "http"
import { Server } from "socket.io";

import { errorMiddleWare } from "../middleware/error-middleware.js";
import { publicRouter } from "../route/publicRouter.js";
import { logger } from "./logging.js";

import { authSocketMiddleware } from "../middleware/auth-socket-middleware.js";
import messageSocketHandler from "../sockets/message-socket.js";
import roomSocketHandlers from "../sockets/room-socket.js";
import participantSocketHandler from "../sockets/participant-socket.js";
import { userRouter } from "../route/userRouter.js";
import userRepo from "../repositories/user-repo.js";


export const app = express()
app.use(cors())
app.use(express.json())
app.use(publicRouter)
app.use(userRouter)
app.use(errorMiddleWare)

export const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
})

io.use(authSocketMiddleware)

const timers = new Map()

io.on('connection', async (socket) => {
    logger.info(`User Connected: ${socket.id}`)
    const userId = socket.user.id

    if (timers.has(userId)) {
        const timer = timers.get(userId)
        
        clearTimeout(timer)
        timers.delete(userId)
    }

    await userRepo.update(
        { id: userId },
        { isOnline: true }
    )
    socket.broadcast.emit('user status change', {
        userId: userId,
        status: 'ONLINE'
    })

    // Message Handlers
    messageSocketHandler.sendMessagesHandler(io, socket)
    messageSocketHandler.typingIndicatorHandler(io, socket)
    messageSocketHandler.deleteMessageHandler(io, socket)
    messageSocketHandler.editMessageHandler(io, socket)


    // ROOM HANDLERS
    roomSocketHandlers.startPrivateRoomHandler(io, socket)
    roomSocketHandlers.createGroupRoomHandler(io, socket)
    roomSocketHandlers.joinRoomHandler(io, socket)

    // Participants Handlers
    participantSocketHandler.addMembersToGroupHandlers(io, socket)
    participantSocketHandler.leaveGroupHandlers(io, socket)
    participantSocketHandler.promoteNewAdminHandlers(io, socket)


    socket.on('disconnect', () => {
        logger.info(`User Disconnected: ${socket.id}`)

        const timer = setTimeout(async () => {
            await userRepo.update(
                { id: userId },
                { isOnline: false }
            )
            timers.delete(userId)
        }, 3000)

        timers.set(userId, timer)
    })
})