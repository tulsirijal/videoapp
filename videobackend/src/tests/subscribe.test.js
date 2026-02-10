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
let user1;
let user2;

beforeAll(async () => {
  await prisma.$connect();
  await cleanDB();

  // create two users

  user1 = await prisma.user.create({
    data: {
      firstname: "A",
      lastname: "B",
      email: "A@gmaill.com",
      password: "A",
    },
  });
  user2 = await prisma.user.create({
    data: {
      firstname: "C",
      lastname: "D",
      email: "B@gmaill.com",
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
describe("Subscription API", () => {
  it("should subcribe to a channel", async () => {
    const res = await request(app)
      .post(`/subscribe/${user2.id}`)
      .set("Cookie", [`accessToken=${token}`]);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message");
    const subscription = await prisma.subscription.findUnique({
      where: {
        subscriberId_subscribedToId: {
          subscriberId: user1.id,
          subscribedToId: user2.id,
        },
      },
    });

    expect(subscription).not.toBeNull();
  });
});
