import { prisma } from "../application/database.js"

const create = async (data) => {
    return prisma.user.create({
        data,
        select: {
            id: true,
            name: true,
            email: true,
        }})
}

const find = async (where) => {
    return prisma.user.findFirst({
        where,
        select: {
            id: true,
            name: true,
            email: true,
        }})
}

const findMany = async (where, options = {}) => {
    return await prisma.user.findMany({
        where,
        ...options
    })
}


const update = async (where, data, options = {}) => {
    return await prisma.user.update({
        where,
        data,
        ...options
    })
}


export default {
    create, find, findMany, update
}