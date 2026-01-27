import messageSocketRepo from "../repositories/message-socket-repo.js";

const saveMessageText = async (roomId, senderId, text) => {
    
    if (!text || text.trim() === "") {
        throw new Error("Pesan tidak boleh kosong");
    }

    return messageSocketRepo.create(
        {
            senderId: senderId,
            roomId: parseInt(roomId),
            text: text
        },
        {
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                    }
                }
            }
        }
    )
}
const loadMessageHistory = async (roomId, cursor) => {
    const message = await messageSocketRepo.findMany(
        { roomId: parseInt(roomId) },
        {   take: 50,
            cursor: cursor ? { id: parseInt(cursor) } : undefined,
            skip: cursor ? 1 : 0,
            orderBy: { createdAt: 'desc' }
        }
    )

    return {
        message,
        nextCursor: message.length > 0 ? message[message.length - 1].id : null
    }
}
export default {
    saveMessageText, loadMessageHistory
}