import { prisma } from "../application/database.js";
import roomSocketRepo from "../repositories/room-socket-repo.js";

const getOrCreatePrivateRoom = async (myId, friendId) => {
    return prisma.$transaction( async (tx) => {
        let room = await roomSocketRepo.find(
            {
                type: 'PRIVATE',
                AND: [
                    {participants : { some : { userId : myId} } },
                    {participants : { some : { userId : friendId} } }
                ]
            },
            {
                include: { participants: true },
                tx
            }
        )

        if (room) {
            return room
        }

        room = await roomSocketRepo.create(
            {
                type: 'PRIVATE',
                participants: {
                    create: [
                        {userId: myId, role: 'MEMBER'},
                        {userId: friendId, role: 'MEMBER'}
                    ]
                }
            },
            {
                include: { participants: true },
                tx
            }
        )
        return room 
    })
}

const createGroupRooom = async (myId, groupName) => {
    const room = await roomSocketRepo.create(
        {
            type: 'GROUP',
            name: groupName || `${myId} GROUP`,
            participants: {
                create: [
                    {userId: myId, role: 'ADMIN'}
            ]}
        },
        {
            include: {participants: true}
        }
    )
    return room 
}



export default {
    getOrCreatePrivateRoom, createGroupRooom
}

// List Feature Tambahan