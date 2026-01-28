import { participantSocketHandlers } from "../utils/socket-helper-function.js"
import participantServices from "../services/participant-services.js"


const addMembersToGroupHandlers = async (io, socket) => {
    socket.on('invite to group', participantSocketHandlers(socket, async (roomId, membersIds) => {

        if (!Array.isArray(membersIds) || membersIds.length === 0) {
                return socket.emit('invite error', { 
                    message: 'Invalid member IDs To add members' 
                })
            }
        const myId = socket.user.id
        const result = await participantServices.addMembersToGroupRoom(myId, roomId, membersIds)
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
    socket.on('leave group', participantSocketHandlers(socket, async (roomId) => {
        const myId = socket.user.id
        const roomIdInt = parseInt(roomId)
        
        if (isNaN(roomIdInt)) {
            return socket.emit('roomError', { 
                message: 'Invalid room ID' 
            })
        }

        const dataUser = await participantServices.leaveGroupRoom(myId, roomIdInt)
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
    socket.on('promote new admin', participantSocketHandlers(socket, async (friendId, roomId) => {

        const myId = socket.user.id
        const roomIdInt = parseInt(roomId)
        const promote = await participantServices.promoteNewAdmin(myId, friendId, roomIdInt)

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
    leaveGroupHandlers, promoteNewAdminHandlers, addMembersToGroupHandlers
}