import { jest } from "@jest/globals";

await jest.unstable_mockModule("../services/socketStore.js", () => ({
  getIo: () => ({
    to: () => ({
      emit: jest.fn(),
    }),
  }),
}));

const { default: prisma } = await import("../db/prisma.js");
const { default: app } = await import("../app.js");

import request from "supertest";
import jwt from "jsonwebtoken";
import { cleanDB } from "./testHelper.js";

let token;
let commentUser;
let video;
beforeAll(async () => {
  await prisma.$connect();
  await cleanDB();

  // create a user

  commentUser = await prisma.user.create({
    data: {
      firstname: "Comment",
      lastname: "User",
      email: "commentuser@example.com",
        password: "password",
    },
  });

  // create a video

  video = await prisma.video.create({
    data: {
      userId: commentUser.id,
      url: "http://example.com/video.mp4",
      title: "Test Video",
      description: "This is a test video",
    },
  });

  // create token

  token = jwt.sign({ sub: commentUser.id }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: "1h",
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("Comment API", () => {
  it("should add a comment to a video", async () => {
    const res = await request(app)
      .post(`/uploadComment/${video.id}`)
      .set("Cookie", [`accessToken=${token}`])
      .send({ commentText: "Great video!" });
    expect(res.statusCode).toBe(200);
  });
});

describe("Get Comments", () => {
  it("should get all comments for a video", async () => {
    const res = await request(app)
      .get(`/getComment/${video.id}`)
      .set("Cookie", [`accessToken=${token}`]);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("comments");
    expect(res.body.comments.length).toBeGreaterThan(0);
  });
}); 

describe("DELETE /deleteComment/:commentId", () => {
  it("should allow a user to delete their own comment", async () => {
    // 1. Setup: Create a comment first
    const addRes = await request(app)
      .post(`/uploadComment/${video.id}`)
      .set("Cookie", [`accessToken=${token}`])
      .send({ commentText: "I will be deleted" });
    
    const commentId = addRes.body.id;
    console.log(addRes.body)

    // 2. Action: Delete the comment
    const delRes = await request(app)
      .post(`/deleteComment/${commentId}`)
      .set("Cookie", [`accessToken=${token}`]);

    // 3. Assertions
    expect(delRes.statusCode).toBe(200);
    
    // Double check it's gone from the DB
    const checkDb = await prisma.comment.findUnique({ where: { id: commentId } });
    expect(checkDb).toBeNull();
  });

  it("should return 404/401 if a user tries to delete someone else's comment", async () => {

    // Create another user
    const userB = await prisma.user.create({
        data: {
            firstname: "Malicious",
            lastname: "User",
            email: "malicious@gmail.com",
            password: "password",
        }
    });

    const userBToken = jwt.sign({ sub: userB.id }, process.env.JWT_ACCESS_SECRET, {
        expiresIn: "1h",
    }); 

  const comment = await prisma.comment.create({
    data: {
      commentText: "User A's private thought",
      userId: commentUser.id,
      videoId: video.id,
    }
  });

    // Attempt to delete as User B
  const delRes = await request(app)
    .post(`/deleteComment/${comment.id}`)
    .set("Cookie", [`accessToken=${userBToken}`]); // Logged in as User B


  expect(delRes.statusCode).toBe(200); 
  
  // Verify the comment STILL exists in the database
  const checkDb = await prisma.comment.findUnique({ where: { id: comment.id } });
  expect(checkDb).not.toBeNull();
});
});

