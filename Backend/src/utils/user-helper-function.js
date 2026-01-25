import {prisma} from "../application/database.js"
import { ResponseError } from "./response-error.js"
import bcrypt from "bcrypt"

export const checkExistingUser = async (userCheck) => {
    const user = await prisma.user.findFirst({
        where: {
            email: userCheck.email
        }
    })
    if (user) {
        throw new ResponseError(409, "User Already Exists")
    }

    return user
}
export const getUserOrThrow = async (logUser) => {
    const user = await prisma.user.findFirst({
        where: { email: logUser.email },
        select: {
            id: true,
            email: true,
            password: true,
            name: true
        }
    })
    
    if (!user) {
        throw new ResponseError(404, "User not found")
    }
    
    return user
}

export const isPasswordValid = async (plainPassword, hashedPassword) => {
    const isValid = await bcrypt.compare(plainPassword, hashedPassword)
    if (!isValid) {
        throw new ResponseError(401,"Username or Password Wrong")
    }
}