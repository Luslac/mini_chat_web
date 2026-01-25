const validate = (schema, request) => {
    const result = schema.parse(request)
    return result
}

export {
    validate
}