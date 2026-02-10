import request from "supertest";
import app from "../app.js";
import prisma from "../db/prisma.js";
import jwt from "jsonwebtoken";
import { JWT_ACCESS_SECRET } from "../config/index.js";
import { cleanDB } from "./testHelper.js";
let token;
let user;
beforeAll(async()=>{
    await prisma.$connect();
    await cleanDB();


 user = await prisma.user.create({
        data:{
            
            firstname:"tulsi",
            lastname:"rijal",
            email:"tulsi1@tmail.com",
            password:"1"
        }
    });
    token = jwt.sign({sub:user.id}, JWT_ACCESS_SECRET, {
        expiresIn:"1h"
    })
});

afterAll(async()=>{
    await prisma.$disconnect();
})

describe("It should get the user info", ()=>{
    it("Should get all the information about the user including all the likes, comments, subscriptions", async()=>{
        const res = await request(app).get(`/getUserInfo/${user.id}`).set('Cookie', [`accessToken=${token}`]);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("userInfo");
    });
})
describe("should get user by id", ()=>{
    it("should get user info by the its id", async()=>{
        const res = await request(app).get(`/getUser/${user.id}`).set('Cookie', [`accessToken=${token}`]);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("user");
    });
})
describe("should get all users in the db", ()=>{
    it("should get all users in the db", async()=>{
        const res = await request(app).get(`/getUsers`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("users");
    });
})