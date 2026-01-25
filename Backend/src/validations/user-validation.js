import {z} from "zod"

const registerUserValidation = z.object({
    email : z.string().max(100), 
    password : z.string().min(8).max(200),
    name : z.string().min(3).max(100)
})

const loginUserValidation = z.object({
    email : z.string().min(3).max(100), 
    password : z.string().min(8).max(200)
})


export {
    registerUserValidation,
    loginUserValidation,
}