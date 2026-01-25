import { prisma } from "../application/database.js"

const find = async (where, options = {}) => {
    return prisma.participant.findFirst({
        where,
        ...options
    })
}

const findMany = async (where, options = {}) => {
    return prisma.participant.findMany({
        where,
        ...options
    })
}

const create = async (data, options = {}) => {
    return prisma.participant.create({
        data,
        ...options
    })
}

const update = async (where, data, options = {}) => {
    return prisma.participant.update({
        where,
        data,
        ...options
    })
}

const createManyWithTransaction = async (data, options = {}) => {
    return prisma.$transaction(async (tx) => {
        return tx.participant.createMany({
            data, 
            ...options
        })
    })
}
export default {
    find, findMany, create, update, createManyWithTransaction
}