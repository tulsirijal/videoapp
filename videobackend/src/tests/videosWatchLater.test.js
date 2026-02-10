import prisma from "../db/prisma.js";
import request from "supertest";
import app from "../app.js";
import jwt from "jsonwebtoken";
import { cleanDB } from "./testHelper.js";

let token;
let watchLaterUser;
let video;

beforeAll(async () => {
  await prisma.$connect();
  await cleanDB();

  // create a user
  watchLaterUser = await prisma.user.create({
    data: {
      firstname: "WatchLater",
      lastname: "User",
      email: "watchlater@gmail.com",
      password: "password",
    },
  });

  // create a video
  video = await prisma.video.create({
    data: {
      userId: watchLaterUser.id,
      url: "http://example.com/video.mp4",
      title: "Watch Later Test Video",
      description: "This is a test video for watch later",
    },
  });

  // create token
  token = jwt.sign({ sub: watchLaterUser.id }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: "1h",
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("Watch Later API", () => {
  it("should add a video to watch later", async () => {
    const res = await request(app)
      .post(`/addToWatchLater/${video.id}`)
      .set("Cookie", [`accessToken=${token}`]);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Video added to Watch Later");
  });

  it("should retrieve the watch later list for the user", async () => {
    const res = await request(app)
      .get("/getWatchLater")
      .set("Cookie", [`accessToken=${token}`]);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("watchLater");
    expect(res.body.watchLater.length).toBeGreaterThan(0);
  });

  it("should remove a video from watch later", async () => {
    const res = await request(app)
      .post(`/removeFromWatchLater/${video.id}`)
      .set("Cookie", [`accessToken=${token}`]);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Video removed from Watch Later");
  });

  it("should not add the same video twice to watch later", async () => {
    // First addition
    await request(app)
      .post(`/addToWatchLater/${video.id}`)
      .set("Cookie", [`accessToken=${token}`]);

    // Second addition
    const res = await request(app)
      .post(`/addToWatchLater/${video.id}`)
      .set("Cookie", [`accessToken=${token}`]);
    expect(res.statusCode).toBe(409);
    expect(res.body.message).toBe("Video already in Watch Later");
  });

  it("should return 401 if user is not authenticated", async () => {
    const res = await request(app).get("/getWatchLater");
    expect(res.statusCode).toBe(401);
  });
});