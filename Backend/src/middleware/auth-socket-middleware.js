import jwt from "jsonwebtoken"
import userRepo from "../repositories/user-repo.js"


export const authSocketMiddleware = async (socket, next) => {
    try {
        const token = socket.handshake.auth.token 
        if (!token) {
            return next(new Error("Unauthorized: Token is missing"))
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        const user = await userRepo.find({
            id: decoded.id,
            email: decoded.email
        })
        
        if (!user) {
            return next(new Error("Unauthorized: User not found"))
        }
        socket.user = user
        next()
    } catch (error) {
        if (error.name === "JsonWebTokenError") {
            return next(new Error("Unauthorized: Invalid token"))
        }

        if (error.name === "TokenExpiredError") {
            return next(new Error("Unauthorized: Token expired"))
        }

        return next(new Error("Unauthorized"))
    }
}