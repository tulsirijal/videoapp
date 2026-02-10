import prisma from "../db/prisma.js";
import { execSync } from "child_process";
export async function cleanDB(){
  execSync("npx prisma db push", { stdio: "inherit" });
  await prisma.subscription.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.like.deleteMany();
    await prisma.video.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.user.deleteMany();
}
