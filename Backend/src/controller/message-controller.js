import messageServices from "../services/message-services.js";

const getHistoryMessage = async (req, res, next) => {
    try {
        const cursor  = req.query.cursor
        const roomId = req.params.roomId

        const result = await messageServices.loadMessageHistory(roomId, cursor)
        
        res.status(200).json({
            success: true,
            message: "Load Message Success",
            data: result.message,
            nextCursor: result.nextCursor
        })
    } catch (error) {
        next(error)
    }
}

export default {
    getHistoryMessage
}