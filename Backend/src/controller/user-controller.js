import userService from "../services/user-service.js";

const registration = async (req, res, next) => {
    try {
        const result = await userService.registration(req)
        res.status(201).json({
            success: true,
            message: "New user created",
            data: {
                token: result.token,
                user: {
                    email: result.email,
                    name: result.name
                }
            }
        })
    } catch (error) {
        next(error)
    }
}

const login = async (req, res, next) => {
    try {
        const result = await userService.login(req)
        res.status(200).json({
            success: true,
            message: "Login success",
            data: {
                token: result.token,
                user: {
                    email: result.email,
                    name: result.name
                }
            }
        })
    } catch (error) {
        next(error)
    }
}

export default {
    registration, login
}