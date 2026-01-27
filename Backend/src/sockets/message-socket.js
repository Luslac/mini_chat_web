import messageServices from "../services/message-services.js";
import { messageSocketHandlers } from "../utils/socket-helper-function.js";

const sendMessagesHandler = (io, socket) => {
    socket.on('send message', messageSocketHandlers(socket, async (data) => {
        const {roomId, text} = data
        
        const messageData = await messageServices.saveMessageText(roomId, socket.user.id, text)
        
        io.to(roomId.toString()).emit('new message', {
            text: messageData.text,
            senderId: messageData.senderId,
            senderName: messageData.user.name,
            roomId: messageData.roomId,
            createdAt: messageData.createdAt
        })
        console.log(`Msg saved in Room ${roomId}: ${text}`)
    }))
}

const typingIndicatorHandler = (io, socket) => {
    socket.on('typing start', messageSocketHandlers(socket, async (roomId) => {

        socket.to(roomId.toString()).emit('typing...', {
            senderName: socket.user.name,
            senderId: socket.user.id,
            roomId: roomId
        })
    })) 

    socket.on('typing stop', messageSocketHandlers(socket, async (roomId) => {

        socket.to(roomId.toString()).emit('typing stop', {
            roomId: roomId
        })
    }))
}
export default {
    sendMessagesHandler, typingIndicatorHandler
}
