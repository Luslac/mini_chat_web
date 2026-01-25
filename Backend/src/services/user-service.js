import { validate } from "../validations/validate.js";
import { loginUserValidation, registerUserValidation } from "../validations/user-validation.js";
import { checkExistingUser, getUserOrThrow, isPasswordValid } from "../utils/user-helper-function.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import userRepo from "../repositories/user-repo.js";


const registration = async (req) => {
    const user = validate(registerUserValidation, req.body)
    await checkExistingUser(user)

    user.password = await bcrypt.hash(user.password, 10)
    return userRepo.create({
        email: user.email,
        password: user.password,
        name: user.name
    })
}

const login = async (req) => {
    const loginRequest = validate(loginUserValidation, req.body)
    const user = await getUserOrThrow(loginRequest)
    await isPasswordValid(loginRequest.password, user.password)

    const token = jwt.sign(
        {   
            id: user.id,
            email: user.email,
            role: 'user'
        },
        process.env.JWT_SECRET,       
        { expiresIn: process.env.JWT_EXPIRES_IN } 
    )
    return {
        email: user.email,
        name: user.name,
        token: token
    }
}

export default {
    registration, login
}