import { describe, it, expect, beforeEach, afterAll, afterEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/application/app.js';
import { prisma } from '../src/application/database.js';
import { deleteAllTestingTableData } from './utils-test.js';


afterAll(async () => {
    await prisma.$disconnect()
})


describe('POST /api/registration', () => {

    beforeEach(async () => {
        await deleteAllTestingTableData()
        
    })
    afterEach(async () => {
        await deleteAllTestingTableData()
    })

    it("Should Register New User", async () => {
        const response = await request(app)
        .post('/api/registration')
        .send({
            email: 'test@test.com',
            password: 'password123',
            name: 'Test User'
        })
        
        console.log(response.body)
        expect(response.status).toBe(201)
        expect(response.body.success).toBe(true)
        expect(response.body.data.user.email).toBe("test@test.com")
    })

    it("Reject double email", async () => {
        await request(app)
        .post('/api/registration')
        .send({
            email: 'test@test.com',
            password: 'password123',
            name: 'Test User'
        })

        const response = await request(app)
        .post('/api/registration')
        .send({
            email: 'test@test.com',
            password: 'password123',
            name: 'Test User'
        })

        console.log(response.body)
        expect(response.status).toBe(409)
    })

    it('should reject short password', async () => {
        const response = await request(app)
        .post('/api/registration')
        .send({
            email: 'test@test.com',
            password: '123',
            name: 'Test'
        })

        expect(response.status).toBe(400);
    });
})


describe('POST /api/login', () => {
    beforeEach(async () => {
        await deleteAllTestingTableData()
        
    })
    afterEach(async () => {
        await deleteAllTestingTableData()
    })

    

    it("Should Login Succesfully", async () => {
        await request(app)
        .post('/api/registration')
        .send({
            email: "test@test.com",
            password: "test1234",
            name: "testerr"
        })

        const response = await request(app)
        .post('/api/login')
        .send({
            email: "test@test.com",
            password: "test1234"
        })
        console.log(response.body)
        expect(response.status).toBe(200)
    })
})