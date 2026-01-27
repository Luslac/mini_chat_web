import { prisma } from "../application/database.js"

const find = async (where, options = {}, tx = prisma) => {
    return tx.room.findFirst({
        where,
        ...options
    })
}

const findMany = async (where, options = {}, tx = prisma) => {
    return tx.room.findMany({
        where,
        ...options
    })
}

const create = async (data, options = {}, tx = prisma) => {
    return tx.room.create({
        data,
        ...options
    })
}

const update = async (where, data, options = {}, tx = prisma) => {
    return tx.room.update({
        where,
        data,
        ...options
    })
}

export default {
    find, findMany, create, update
}
