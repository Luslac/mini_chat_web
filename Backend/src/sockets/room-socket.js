import roomServices from "../services/room-services.js";


export const createGroupRoomHandler = async (io, socket) => {
    socket.on('create room', async (roomName) => {
        try {
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
        } catch (error) {
            console.log(`Error: Created Room Error`)
            socket.emit('error create room', error.message)
        }
    })
}


export const addMembersToGroupHandlers = async (io, socket) => {
    // anggap fe sudah menyiapkan tombol 'add all' ketika sudah memilih friendlist 
    socket.on('invite to group', async (roomId, membersIds) => {
        try {

            if (!Array.isArray(membersIds) || membersIds.length === 0) {
                return socket.emit('invite error', { 
                    message: 'Invalid member IDs' 
                })
            }
            const myId = socket.user.id
            const result = await roomServices.addMembersToGroupRoom(myId, roomId, membersIds)

            io.to(roomId).emit('members added', {
                count: result.countMembersAdd,
                newMembers: result.addedIds
            })

            socket.emit('invite success', {
                roomId: result.roomId,
                addedMembers: result.countMembersAdd,
                membersData: result.addedIds
            })

            console.log(`Members Added: ${result.countMembersAdd}`)
        } catch (error) {
            socket.emit('error invite friend', error.message)
        }
    })
}