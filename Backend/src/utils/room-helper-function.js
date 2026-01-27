import participantsSocketRepo from "../repositories/participants-socket-repo.js";
import roomSocketRepo from "../repositories/room-socket-repo.js";
import { ResponseError } from "./response-error.js";

export const isIdAdmin = async (id, roomId) => {
    const isAdmin = await participantsSocketRepo.find(
        { userId: id, roomId: roomId, role: 'ADMIN' },
        { select: { userId: true } }
    )

    if (!isAdmin) {
        throw new ResponseError(404, 'Not An Admin Of The Group')
    }

    return isAdmin
}

export const isAlreadyAnAdmin = async (id, roomId) => {
    const alreadyAdmin = await  participantsSocketRepo.find(
        { userId: id, roomId: roomId, role: 'ADMIN' },
        { select: { userId: true } }
    )

    if (alreadyAdmin) {
        throw new ResponseError(400, 'Already An Admin')
    }

    return alreadyAdmin
}