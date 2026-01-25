import participantsSocketRepo from "../repositories/participants-socket-repo.js";
import roomSocketRepo from "../repositories/room-socket-repo.js";
import userRepo from "../repositories/user-repo.js";
import { ResponseError } from "../utils/response-error.js";


const getOrCreatePrivateRoom = async (myId, friendId) => {
    let room = await roomSocketRepo.find(
        {
            type: 'PRIVATE',
            AND: [
                {participants : { some : { userId : myId} } },
                {participants : { some : { userId : friendId} } }
            ]
        },
        {
            include: { participants: true }
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
            include: { participants: true }
        }
    )
    return room 
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

const addMembersToGroupRoom = async (myId, roomId, membersId = []) => {
    const isAdmin = await participantsSocketRepo.find({
        roomId: parseInt(roomId),
        userId: myId,
        role: 'ADMIN'
    })

    if (!isAdmin) {
        throw new ResponseError(401, "Unauthorized: NOT ADMIN OF THE GROUP")
    }

    const existingUser = await userRepo.findMany(
        { id: {in: membersId} },
        { select : { id: true }}
    ) // Cari user yang emang ada dan ambil id aja biar ga berat

    const validUserIds = existingUser.map(u => u.id)

    const existingMember = await participantsSocketRepo.findMany(
        { userId: {in : membersId}, roomId: parseInt(roomId)},
        { select: {userId: true}}
    ) // Cari user yang udah jadi member groupnya (takut salah invite atau invite dua kali)

    const existingMemberIds = new Set(existingMember.map(m => m.userId))

    const newMembersId = validUserIds.filter(id => !existingMemberIds.has(id))
    // Filter, cuman ambil yang baru masuk aja

    if (newMembersId.length <= 0) {
        throw new ResponseError(400, 'No Valid Id To Add')
    }

    const newMembersData = newMembersId.map(userId => ({
        roomId: parseInt(roomId),
        userId: userId,
        role: 'MEMBER'
    }))
    const addedMembers = await participantsSocketRepo.createManyWithTransaction(
        newMembersData 
    )

    return {
        countMembersAdd: addedMembers.count,
        roomId: roomId,
        addedIds: newMembersId,
        invalidIds: membersId.filter(id => !validUserIds.includes(id)),
        alreadyMember: existingMemberIds
    }
}

export default {
    getOrCreatePrivateRoom, createGroupRooom, addMembersToGroupRoom
}
