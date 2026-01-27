import request from 'supertest';
import { io } from "socket.io-client";
import bcrypt from "bcrypt";

import { app } from './src/application/app.js';
import { prisma } from "./src/application/database.js";
import { deleteAllTestingTableData, createTestingUser } from './test/utils-test.js';

// ==================== SETUP ====================
await deleteAllTestingTableData();
await createTestingUser();

await prisma.user.create({
    data: {
        email: "bawhahaa@test.com",
        password: await bcrypt.hash("12312311234", 10),
        name: "Kurokawa"
    }
});

// ==================== LOGIN ====================
const response = await request(app)
    .post('/api/login')
    .send({
        email: "test@test.com",
        password: "test1234"
    });

const response2 = await request(app)
    .post('/api/login')
    .send({
        email: "bawhahaa@test.com",
        password: "12312311234"
    });

// ==================== GET DATA ====================
const friendIdTarget = await prisma.user.findFirst({
    where: { email: response2.body.data.user.email },
    select: { id: true }
});

const YOUR_TOKEN = response.body.data.token;

// ==================== SOCKET CONNECTION ====================
const socket = io("http://localhost:3000", {
    auth: {
        token: YOUR_TOKEN
    }
});

// Event: Connect
socket.on("connect", () => {
    console.log(`Connected! Mencoba membuat ROOM`);
    socket.emit('create room', "CUMAN EVOS M1");
});

// Event: Room Created
socket.on('room created', (data) => {
    console.log("Room berhasil dibuat!", data);
    
    socket.emit('invite to group', data.roomId, [friendIdTarget.id])
    socket.emit('send message', {
        roomId: data.roomId,
        text: "Halo bro, ini chat dari script!"
    });
});

// Event: Invite Success
socket.on('invite success', (data) => {
    console.log(`Friend Invited Success : ${data.membersData}`)
})

// Event: Invite Error
socket.on('invite error', (err) => {
    console.error("Invite Error (Validation):", err)
})

// Event: New Message
socket.on('new message', (msg) => {
    console.log("Pesan masuk:", msg)
})

// Event: Error handling (optional)
socket.on("connect_error", (err) => {
    console.error("Connection error:", err.message)
})

socket.on("disconnect", () => {
    console.log("Disconnected from server")
})