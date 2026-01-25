import { Server } from "socket.io";
import { server } from "./application/app.js";
import { logger } from "./application/logging.js";
import http from "http"
import { authSocketMiddleware } from "./middleware/auth-socket-middleware.js";
import { registerChatHandlers } from "./sockets/chat-socket.js";


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    logger.info(`Server Connected To Port ${PORT}`)
})