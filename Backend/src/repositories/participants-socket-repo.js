import { prisma } from "../application/database.js"

const find = async (where, options = {}, tx = prisma) => {
    return tx.participant.findFirst({
        where,
        ...options
    })
}

const findMany = async (where, options = {}, tx = prisma) => {
    return tx.participant.findMany({
        where,
        ...options
    })
}

const create = async (data, options = {}, tx = prisma) => {
    return tx.participant.create({
        data,
        ...options
    })
}

const update = async (where, data, options = {}, tx = prisma) => {
    return tx.participant.update({
        where,
        data,
        ...options
    })
}

const count = async (where, tx = prisma) => {
    return tx.participant.count({
        where
    })
}

const createManyWithTransaction = async (data, options = {}, tx = prisma) => {
    return prisma.$transaction(async (tx) => {
        return tx.participant.createMany({
            data, 
            ...options
        })
    })
}

const deleteParticipant = async (where, tx = prisma) => {
    return tx.participant.delete({
        where
    })
}
export default {
    find, findMany, create, update, createManyWithTransaction, deleteParticipant, count
}