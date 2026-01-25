import { prisma } from "../src/application/database.js";
import bcrypt from "bcrypt"

export const createTestingUser = async () => {
    await prisma.user.create({
        data: {
            email: "test@test.com",
            password: await bcrypt.hash("test1234",10),
            name: "Amamiya"
        }
    })
}

// Gunakan ini ketika masih dalam tahap develop saja
export const deleteAllTestingTableData = async () => {
    await prisma.message.deleteMany()
    await prisma.room.deleteMany()
    await prisma.user.deleteMany()
}