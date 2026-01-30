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
            messageId: messageData.id,
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

const deleteMessageHandler = (io, socket) => {
    socket.on('delete message', messageSocketHandlers(socket, async (roomId, messageId) => {
        const messageData = await messageServices.deleteMessage(roomId, socket.user.id, parseInt(messageId))

        io.to(messageData.roomId.toString()).emit('message deleted', {
            messageId: messageData.id,
            roomId: messageData.roomId
        })
    }))
}

const editMessageHandler = (io, socket) => {
    socket.on('edit message', messageSocketHandlers(socket, async (roomId, messageId, updateText) => {
        const myId = socket.user.id
        const updateData = await messageServices.editMessage({roomId, myId, messageId, updateText})

        io.to(updateData.roomId.toString()).emit('message edited', {
            messageId: updateData.id,
            roomId: updateData.roomId,
            senderId: updateData.senderId,
            isEdited: true,
            text: updateData.text
        })
    }))
}


export default {
    sendMessagesHandler, typingIndicatorHandler, deleteMessageHandler, editMessageHandler
}
