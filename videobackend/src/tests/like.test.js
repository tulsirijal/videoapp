import prisma from "../db/prisma.js";
import request from "supertest";
import app from "../app.js";
import jwt from "jsonwebtoken";
import { cleanDB } from "./testHelper.js";
let token;
let user1;
let user2;
let uploadVideo
beforeAll(async () => {
  await prisma.$connect();
  await cleanDB();
  // create two users

  user1 = await prisma.user.create({
    data: {
      firstname: "A",
      lastname: "B",
      email: "A@gmail.com",
      password: "A",
    },
  });
  user2 = await prisma.user.create({
    data: {
      firstname: "C",
      lastname: "D",
      email: "B@gmail.com",
      password: "B",
    },
  });

  // log the user to create token

  token = jwt.sign({ sub: user1.id }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: "1h",
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("Should toggle the like", () => {
  it("should toggle the like", async () => {
     uploadVideo = await prisma.video.create({
      data: {
        userId: user1.id,
        url: "http://video.mp4",
        title: "first video",
        description: "first description",
      },
    });

    const response = await request(app)
      .post(`/likeVideo/${uploadVideo.id}`)
      .set("Cookie", [`accessToken=${token}`]);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("message");
  });
});

describe("should get the like counts on a video", ()=>{
  it("should get the like count", async()=>{
    const res = await request(app).get(`/getLikeCount/${uploadVideo.id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("likeCount")
  })
})

describe("should get the liked videos of a user", () => {
  it("should get the liked videos", async () => {
    const res = await request(app)
      .get(`/likedVideos`)
      .set("Cookie", [`accessToken=${token}`]);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("likedVideos");
    expect(res.body.likedVideos.length).toBeGreaterThan(0);
  });
});
