import express from "express";
import cors from "cors"
import http from "http"
import { Server } from "socket.io";

import { errorMiddleWare } from "../middleware/error-middleware.js";
import { publicRouter } from "../route/publicRouter.js";
import { logger } from "./logging.js";

import { authSocketMiddleware } from "../middleware/auth-socket-middleware.js";
import messageSocketHandlers from "../sockets/message-socket.js";
import roomSocketHandlers from "../sockets/room-socket.js";
import { userRouter } from "../route/userRouter.js";


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

io.on('connection', (socket) => {
    logger.info(`User Connected: ${socket.id}`)

    messageSocketHandlers.sendMessagesHandler(io, socket)
    messageSocketHandlers.typingIndicatorHandler(io, socket)



    // ROOM HANDLERS
    roomSocketHandlers.startPrivateRoomHandler(io, socket)
    roomSocketHandlers.createGroupRoomHandler(io, socket)
    roomSocketHandlers.addMembersToGroupHandlers(io, socket)
    roomSocketHandlers.leaveGroupHandlers(io, socket)
    roomSocketHandlers.promoteNewAdminHandlers(io, socket)


    socket.on('disconnect', () => {
        logger.info(`User Disconnected: ${socket.id}`)
    })
})