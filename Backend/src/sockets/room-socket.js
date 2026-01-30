import messageServices from "../services/message-services.js";
import roomServices from "../services/room-services.js";
import { ResponseError } from "../utils/response-error.js";
import { roomSocketHandlers } from "../utils/socket-helper-function.js";


const startPrivateRoomHandler =  (io, socket) => {
    socket.on('start private chat', roomSocketHandlers(socket, async (friendId) => {
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
    }))
}


const createGroupRoomHandler =  (io, socket) => {
    socket.on('create room', roomSocketHandlers(socket, async (roomName) => {

        const myId = socket.user.id
        const room = await roomServices.createGroupRooom(myId, roomName)
        console.log(`ERROR KAH??????????????`)
        const roomStringId = room.id.toString()
        socket.join(roomStringId)

        socket.emit('room created', {
            roomId: roomStringId,
            roomType: room.type,
            roomName: room.name,
            createdAt: room.createdAt
        })
        console.log(`Created ROOM : ${roomStringId} | ${room.type} | ${roomName} | ${room.createdAt}`)
    }))
}

const joinRoomHandler = (io, socket) => {
    socket.on('join room', roomSocketHandlers(socket, async (roomId) => {

        if (!roomId) {
            throw new ResponseError(404, "Room Not Found")
        }
        const roomString = roomId.toString()
        socket.join(roomString)
        console.log(`User ${socket.user.name} Berhasil Masuk Ke Dalam ROOM ${roomId}`)

        await messageServices.markStatusMessageAsRead(roomId, socket.user.id)

        socket.to(roomId.toString()).emit('messages read', {
            roomId: roomId,
            readBy: socket.user.id
        })
    }))
}


export default {
    startPrivateRoomHandler, createGroupRoomHandler, joinRoomHandler
}