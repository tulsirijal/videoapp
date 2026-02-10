import request from "supertest";
import app from "../app.js";
import prisma from "../db/prisma.js";
import jwt from 'jsonwebtoken'
import { JWT_REFRESH_SECRET } from "../config/index.js";
import { cleanDB } from "./testHelper.js";
let refreshToken;
let user;
beforeAll( async() => {
    await prisma.$connect();
    await cleanDB()


    user = await prisma.user.create({
      data:{
      email: "hello1@gmail.com",
      password: "hello",
      firstname: "tulsirijal",
      lastname: "tulsirijal",
      }
    });

    refreshToken = jwt.sign({sub:user.id}, JWT_REFRESH_SECRET, {
      expiresIn:"1h"
    });

     await prisma.refreshToken.create({
      data:{
        token:refreshToken,
        user:{
          connect:{
            id:user.id
          }
        }
      }
    })

    
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("Auth API", () => {
  it("should register a user", async () => {
    const response = await request(app).post("/register").send({
      email: "hello@gmail.com",
      password: "hello",
      firstname: "tulsirijal",
      lastname: "tulsirijal",
    });
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("access");
    expect(response.body).toHaveProperty("refresh");
    expect(response.body).toHaveProperty("user");

  });

  it("should login", async () => {
    const response = await request(app).post("/login").send({
      email: "hello@gmail.com",
      password: "hello",
    });
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("user");

  });

  it("should create a new access token", async ()=>{
    const res = await request(app).post('/refresh').set('Cookie', [`refreshToken=${refreshToken}`]);
    expect(res.statusCode).toBe(200);
  });

  it("should logout", async ()=>{
    const res = await request(app).post('/logout').set('Cookie', [`refreshToken=${refreshToken}`]);
    expect(res.statusCode).toBe(200);
  });
});
