import prisma from "../db/prisma.js";
import request from "supertest";
import app from "../app.js";
import jwt from "jsonwebtoken";
import { cleanDB } from "./testHelper.js";

let token;
let video;
let studioUser;

beforeAll(async () => {
  await prisma.$connect();
  await cleanDB();

  // create a user
  studioUser = await prisma.user.create({
    data: {
      firstname: "Studio",
      lastname: "User",
      email: " studio@gmail.com",
      password: "password",
    },
  });

  // create videos

    video = await prisma.video.create({
      data: {
        userId: studioUser.id,
        url: `http://example.com/video.mp4`,
        title: `Studio Test Video`,
        description: `This is test video number for studio stats`,
        views: 100,
      },
    });

    const like = await prisma.like.create({
      data: {
        userId: studioUser.id,
        videoId: video.id,
      },
    });

    const comment = await prisma.comment.create({
      data: {
        userId: studioUser.id,
        videoId: video.id,
        commentText: "Nice video!",
      },
    });


  // create token
  token = jwt.sign({ sub: studioUser.id }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: "1h",
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("Studio Analytics API", () => {
  it("should retrieve studio analytics data", async () => {
    const res = await request(app)
      .get("/studioStats")
      .set("Cookie", [`accessToken=${token}`]);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("summary");
    expect(res.body).toHaveProperty("videos");
    expect(res.body).toHaveProperty("chartData");
  });
});
