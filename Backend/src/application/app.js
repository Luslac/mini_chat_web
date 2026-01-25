import express from "express";
import { errorMiddleWare } from "../middleware/error-middleware.js";
import { publicRouter } from "../route/publicRouter.js";
import cors from "cors"
import { Server } from "socket.io";
import { logger } from "./logging.js";
import http from "http"
import { authSocketMiddleware } from "../middleware/auth-socket-middleware.js";
import { registerChatHandlers } from "../sockets/chat-socket.js";
import { addMembersToGroupHandlers, createGroupRoomHandler } from "../sockets/room-socket.js";

export const app = express()
app.use(cors())
app.use(express.json())
app.use(publicRouter)
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

    registerChatHandlers(io, socket)
    createGroupRoomHandler(io, socket)
    addMembersToGroupHandlers(io, socket)

    socket.on('disconnect', () => {
        logger.info(`User Disconnected: ${socket.id}`)
    })
})