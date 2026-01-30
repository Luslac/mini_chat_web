import messageSocketRepo from "../repositories/message-socket-repo.js";
import { ResponseError } from "../utils/response-error.js";
import participantsSocketRepo from "../repositories/participants-socket-repo.js";

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
const loadMessageHistory = async (roomId, cursor, myId) => {
    const isMember = await participantsSocketRepo.find({
        roomId: parseInt(roomId),
        userId: myId
    });

    if (!isMember) {
        throw new ResponseError(401,"Unauthorized: You are not in this room");
    }
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


const deleteMessage = async (roomId, myId, messageId) => {
    const message = await messageSocketRepo.find(
        { roomId: parseInt(roomId), senderId: myId, id: messageId },
        { select: { id: true, roomId: true, senderId: true } }
    )

    if (!message) {
        throw new ResponseError(404, "Message Not Found")
    }

    return message

}

const editMessage = async (data) => {
    const {roomId, myId, messageId, updateText} = data

    const message = await messageSocketRepo.find(
        { roomId: roomId, senderId: myId, id: messageId },
        { select: { id: true, roomId: true, senderId: true } }
    )

    if (!message) {
        throw new ResponseError(404, "Message Not Found")
    }

    const updateMessage = await messageSocketRepo.update(
        { roomId: roomId, senderId: myId, id: messageId },
        { text: updateText},
        { select: { id: true, roomId: true, senderId: true, text: true } }
    )

    return updateMessage
}

const markStatusMessageAsRead = async (roomId, myId) => {
    return messageSocketRepo.updateMany(
        { roomId: roomId, senderId: { not : myId}, status: { not : "READ"}},
        { status: "READ"}
    )
    
}
export default {
    saveMessageText, loadMessageHistory, deleteMessage, editMessage, markStatusMessageAsRead
}

// List Up Coming Feature: 
// 1. Delete Message, 2. Edit Message