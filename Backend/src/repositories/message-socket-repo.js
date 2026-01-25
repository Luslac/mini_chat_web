import { prisma } from "../application/database.js"

const find = async (where, options = {}) => {
    return await prisma.message.findFirst({
        where,
        ...options
    })
}

const findMany = async (where, options = {}) => {
    return await prisma.message.findMany({
        where,
        ...options
    })
}

const create = async (data, options = {}) => {
    return await prisma.message.create({
        data,
        ...options
    })
}

const update = async (where, data, options = {}) => {
    return await prisma.message.update({
        where,
        data,
        ...options
    })
}

export default {
    find, findMany, create, update
}