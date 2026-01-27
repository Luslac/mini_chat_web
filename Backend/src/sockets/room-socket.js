import roomServices from "../services/room-services.js";
import { roomSocketHandlers } from "../utils/socket-helper-function.js";


const startPrivateRoomHandler = async (io, socket) => {
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


const createGroupRoomHandler = async (io, socket) => {
    socket.on('create room', roomSocketHandlers(socket, async (roomName) => {
        const myId = socket.user.id
        const room = await roomServices.createGroupRooom(myId, roomName)

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


const addMembersToGroupHandlers = async (io, socket) => {
    // anggap fe sudah menyiapkan tombol 'add all' ketika sudah memilih friendlist 
    socket.on('invite to group', roomSocketHandlers(socket, async (roomId, membersIds) => {

        if (!Array.isArray(membersIds) || membersIds.length === 0) {
                return socket.emit('invite error', { 
                    message: 'Invalid member IDs To add members' 
                })
            }
        const myId = socket.user.id
        const result = await roomServices.addMembersToGroupRoom(myId, roomId, membersIds)
        socket.join()

        io.to(roomId).emit('members added', {
            count: result.countMembersAdd,
            newMembers: result.addedIds
        })

        result.addedIds.forEach(userId => {
            io.to(`user_${userId}`).emit('invited to group', {
                roomId: roomId, 
                invitedBy: myId,
                inviterName: socket.user.name
            })
        })

        socket.emit('invite success', {
            roomId: result.roomId,
            addedMembers: result.countMembersAdd,
            membersData: result.addedIds
        })
        console.log(`Members Added: ${result.countMembersAdd}`)
    }))
}

const leaveGroupHandlers = async (io, socket) => {
    socket.on('leave group', roomSocketHandlers(socket, async (roomId) => {
        const myId = socket.user.id
        const roomIdInt = parseInt(roomId)
        
        if (isNaN(roomIdInt)) {
            return socket.emit('roomError', { 
                message: 'Invalid room ID' 
            })
        }

        const dataUser = await roomServices.leaveGroupRoom(myId, roomIdInt)
        const roomIdString = roomIdInt.toString()

        io.to(roomIdString).emit(`member leave group`, {
            name: dataUser.userName,
            roomName: dataUser.roomName,
            leftAt: new Date()
        })

        socket.leave(roomIdString)
        socket.emit('leave group success', {
            name: dataUser.userName,
            roomId: dataUser.roomId,
            roomName: dataUser.roomName,
            leftAt: new Date()
        })
    }))
}

const promoteNewAdminHandlers = async (io, socket) => {
    socket.on('promote new admin', roomSocketHandlers(socket, async (friendId, roomId) => {

        const myId = socket.user.id
        const roomIdInt = parseInt(roomId)
        const promote = await roomServices.promoteNewAdmin(myId, friendId, roomIdInt)

        const roomIdString = roomIdInt.toString()
        socket.emit('promote new admin success', {
            userName: promote.user.name,
            userId: promote.userId,
            userRole: promote.role,
            roomId: roomIdString
        })
    }))
}

export default {
    startPrivateRoomHandler, leaveGroupHandlers, createGroupRoomHandler, addMembersToGroupHandlers,
    promoteNewAdminHandlers
}