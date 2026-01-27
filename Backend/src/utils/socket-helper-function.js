export const roomSocketHandlers = (socket, handler) => {
    return async (...args) => {
        try {
            await handler(...args)
        } catch (error) {
            if (error.status) {
                socket.emit('roomError', {
                    message: error.message,
                    status: error.status
                });
            } else {
                console.error("Socket Error:", error);
                socket.emit('error', { message: "Internal Server Error" });
            }
        }
    }
}

export const messageSocketHandlers = (socket, handler) => {
    return async (...args) => {
        try {
            await handler(...args)
        } catch (error) {
            if (error.status) {
                socket.emit('roomError', {
                    message: error.message,
                    status: error.status
                });
            } else {
                console.error("Socket Error:", error);
                socket.emit('error', { message: "Internal Server Error" });
            }
        }
    }
}