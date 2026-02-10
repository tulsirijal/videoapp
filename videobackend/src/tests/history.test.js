import prisma from "../db/prisma.js";
import request from "supertest";
import app from "../app.js";
import jwt from "jsonwebtoken";
import { cleanDB } from "./testHelper.js";

let token;
let historyUser;
let video;

beforeAll(async () => {
  await prisma.$connect();
  await cleanDB();

  // create a user
  historyUser = await prisma.user.create({
    data: {
      firstname: "History",
      lastname: "User",
      email: "history@gmail.com",
      password: "password",
    },
  });

  // create a video
  video = await prisma.video.create({
    data: {
      userId: historyUser.id,
      url: "http://example.com/video.mp4",
      title: "History Test Video",
      description: "This is a test video for history",
    },
  });

  // create token
  token = jwt.sign({ sub: historyUser.id }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: "1h",
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("Watch History API", () => {
  it("should add a video to watch history", async () => {
    const res = await request(app)
      .post(`/addHistory/${video.id}`)
      .set("Cookie", [`accessToken=${token}`]);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Watch history added");
  });

  it("should retrieve the watch history for the user", async () => {
    const res = await request(app)
      .get("/getHistory")
      .set("Cookie", [`accessToken=${token}`]);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("history");
    expect(res.body.history.length).toBeGreaterThan(0);
  });

  it("should delete a specific history entry", async () => {
    // First, get the history to find an entry to delete
    const getRes = await request(app)
      .get("/getHistory")
      .set("Cookie", [`accessToken=${token}`]);
    const historyId = getRes.body.history[0].id;

    // Now, delete that history entry
    const deleteRes = await request(app)
      .post(`/deleteHistory/${historyId}`)
      .set("Cookie", [`accessToken=${token}`]);
    expect(deleteRes.statusCode).toBe(200);
    expect(deleteRes.body.message).toBe("Watch history deleted");
  });

  it("should delete all watch history for the user", async () => {
    const res = await request(app)
      .post("/deleteAllHistory")
      .set("Cookie", [`accessToken=${token}`]);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("All watch history cleared");
  });
});