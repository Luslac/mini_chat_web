import { prisma } from "../application/database.js"

const find = async (where, options = {}, tx = prisma) => {
    return tx.message.findFirst({
        where,
        ...options
    })
}

const findMany = async (where, options = {}, tx = prisma) => {
    return tx.message.findMany({
        where,
        ...options
    })
}

const create = async (data, options = {}, tx = prisma) => {
    return tx.message.create({
        data,
        ...options
    })
}

const update = async (where, data, options = {}, tx = prisma) => {
    return tx.message.update({
        where,
        data,
        ...options
    })
}

const updateMany = async (where, data) => {
    return prisma.message.updateMany({
        where,
        data
    })
}
export default {
    find, findMany, create, update, updateMany
}