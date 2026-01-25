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

export default {
    saveMessageText
}