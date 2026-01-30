import request from 'supertest';
import { io } from "socket.io-client";
import bcrypt from "bcrypt";

import { app } from './src/application/app.js';
import { prisma } from "./src/application/database.js";
import { deleteAllTestingTableData, createTestingUser } from './test/utils-test.js';

// ==================== SETUP DATA ====================
console.log("[INFO] Preparing database for testing...");
await deleteAllTestingTableData();

// 1. Create Main User (User A)
await createTestingUser(); 

// 2. Create Friend User (User B)
await prisma.user.create({
    data: {
        email: "bawhahaa@test.com",
        password: await bcrypt.hash("12312311234", 10),
        name: "Kurokawa"
    }
});
console.log("[INFO] Database setup complete.");

// ==================== LOGIN (HTTP) ====================
console.log("[INFO] Logging in Main User...");
const response = await request(app)
    .post('/api/login')
    .send({
        email: "test@test.com",
        password: "test1234"
    });

if (response.status !== 200) {
    console.error("[ERROR] Login failed");
    process.exit(1);
}

const YOUR_TOKEN = response.body.data.token;
console.log("[SUCCESS] Login success. Token received.");

// ==================== FETCH FRIEND ID (HTTP Endpoint) ====================
// Requirement: Get friend list from API, not direct DB access
console.log("[INFO] Searching for friend via API...");

const friendSearchResponse = await request(app)
    .get('/api/users')
    .query({ name: "Kurokawa" }) 
    .set('Authorization', YOUR_TOKEN); 

    console.log('=== FRIEND SEARCH RESPONSE ===');
console.log('Status:', friendSearchResponse.status);
console.log('Body:', JSON.stringify(friendSearchResponse.body, null, 2));
console.log('Data:', friendSearchResponse.body.data);
console.log('Error:', friendSearchResponse.error);
console.log('==============================');

if (friendSearchResponse.status !== 200 || friendSearchResponse.body.data.length === 0) {
    console.error("[ERROR] Failed to find friend via API");
    process.exit(1);
}

const friendIdTarget = friendSearchResponse.body.data[0].id
console.log(`[SUCCESS] Friend found via API. ID: ${friendIdTarget}`);

// ==================== SOCKET CONNECTION ====================
console.log("[INFO] Connecting to Socket.io...");
const socket = io("http://localhost:3000", {
    auth: {
        token: YOUR_TOKEN
    }
});


let activeRoomId = null;

// ==================== SOCKET EVENT HANDLERS ====================

// 1. CONNECT & CREATE ROOM
socket.on("connect", () => {
    console.log(`[SUCCESS] Connected to server. Socket ID: ${socket.id}`);
    
    console.log("[ACTION] Creating room 'CUMAN EVOS M1'...");
    socket.emit('create room', "CUMAN EVOS M1");
});

// 2. ROOM CREATED & INVITE
socket.on('room created', (data) => {
    console.log(`[SUCCESS] Room created. Room ID: ${data.roomId}`);
    activeRoomId = data.roomId;
    
    console.log(`[ACTION] Inviting friend ID ${friendIdTarget}...`);
    socket.emit('invite to group', data.roomId, [friendIdTarget]);
});

// 3. INVITE SUCCESS & SEND MESSAGE
socket.on('invite success', (data) => {
    console.log(`[SUCCESS] Friend invited successfully.`);
    
    console.log(`[ACTION] Sending message...`);
    socket.emit('send message', {
        roomId: data.roomId,
        text: "TESTING CHAT HISTORY 123"
    });
});


// 4. MESSAGE SENT & FETCH HISTORY
socket.on('new message', async (data) => {
    console.log(`[SUCCESS] New message received: "${data.text}"`);
    console.log(`[INFO] Sender ID: ${data.senderId} | Room ID: ${data.roomId}`);


    console.log("[ACTION] Verifying message persistence via API History...");
    
    try {
        const historyResponse = await request(app)
            .get(`/api/room/${data.roomId}/message`)
            .set('Authorization', YOUR_TOKEN);

        if (historyResponse.status === 200) {
            const messages = historyResponse.body.data;
            // Validasi apakah pesan yang baru dikirim ada di list history
            const isMessageSaved = messages.some(msg => msg.id === data.messageId || msg.text === "TESTING CHAT HISTORY 123");
            
            if (isMessageSaved) {
                console.log(`[SUCCESS] API History verification passed. Message count: ${messages.length}`);
            } else {
                console.warn(`[WARNING] Message not found in API History yet (Possible latency).`);
            }
        } else {
            console.error(`[ERROR] Failed to fetch history via API. Status: ${historyResponse.status}`);
        }
    } catch (err) {
        console.error(`[ERROR] API Request failed: ${err.message}`);
    }

    // Lanjut ke Edit Message setelah verifikasi
    console.log(`[ACTION] Editing message ID ${data.messageId}...`);
    socket.emit('edit message', data.roomId, data.messageId, "MOONTOON ASEMMMM (EDITED)");
})

// 5. MESSAGE EDITED & DELETE
socket.on('message edited', (data) => {
    console.log(`[SUCCESS] Message edited: ${JSON.stringify(data)}`);
    
    // Setelah edit sukses, baru delete (biar berurutan)
    console.log(`[ACTION] Deleting message ID ${data.messageId}...`);
    socket.emit('delete message', activeRoomId, data.messageId);
});

// 6. MESSAGE DELETED & PROMOTE ADMIN
socket.on('message deleted', (data) => {
    console.log(`[SUCCESS] Message deleted: ${JSON.stringify(data)}`);

    console.log(`[ACTION] Promoting user ${friendIdTarget} to admin...`);
    socket.emit('promote new admin', friendIdTarget, activeRoomId);
});

// 7. PROMOTE SUCCESS & LEAVE GROUP
socket.on('promote new admin success', (data) => {
    console.log(`[SUCCESS] Promoted user to admin.`);
    
    console.log(`[ACTION] Leaving group...`);
    socket.emit('leave group', data.roomId);
});

// 8. LEAVE SUCCESS & FINISH
socket.on('leave group success', (data) => {
    console.log(`[SUCCESS] Left group successfully.`);
    console.log(`[INFO] All test operations completed.`);
    socket.disconnect();
});



// ==================== ERROR HANDLERS ====================
const handleSocketError = (type, error) => {
    console.error(`[ERROR] ${type}:`, error);
    socket.disconnect();
    process.exit(1);
};

socket.on('roomError', (err) => handleSocketError("ROOM ERROR", err));
socket.on('messageError', (err) => handleSocketError("MESSAGE ERROR", err));
socket.on('error', (err) => handleSocketError("GENERAL ERROR", err));
socket.on('invite error', (err) => handleSocketError("INVITE ERROR", err));

socket.on("disconnect", () => {
    console.log("[INFO] Client disconnected from server.");
});