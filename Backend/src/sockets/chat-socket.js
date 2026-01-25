import roomServices from "../services/room-services.js";
import messageServices from "../services/message-services.js";

export const registerChatHandlers = (io, socket) => {
    
    socket.on('start chat', async (friendId) => {
        try {
            const myId = socket.user.id

            const room = await roomServices.getOrCreatePrivateRoom(myId, parseInt(friendId))

            const roomStringId = room.id.toString()
            socket.join(roomStringId)

            socket.emit('room joined', {
                roomId: roomStringId,
                roomType: room.type,
                partnerId: friendId
            })
            console.log(`User ${myId} join room ${room.id} with ${friendId}`)

        } catch (error) {
            console.log(`Error: ${error}`)
            socket.emit('error', 'Start Chat Error')
        }
    })

    socket.on('send message', async (data) => {
        try {
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

        } catch (error) {
            console.log(`Error: ${error}`)
            socket.emit('error', 'Send Message Error')
        }
    })
}