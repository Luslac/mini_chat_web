import { prisma } from "../application/database.js"

const find = async (where, options = {}) => {
    return await prisma.room.findFirst({
        where,
        ...options
    })
}

const findMany = async (where, options = {}) => {
    return await prisma.room.findMany({
        where,
        ...options
    })
}

const create = async (data, options = {}) => {
    return await prisma.room.create({
        data,
        ...options
    })
}

const update = async (where, data, options = {}) => {
    return await prisma.room.update({
        where,
        data,
        ...options
    })
}

export default {
    find, findMany, create, update
}
