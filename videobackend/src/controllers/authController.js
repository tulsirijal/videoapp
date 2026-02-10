import prisma from "../db/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET,
  ACCESS_TOKEN_EXPIRES,
  REFRESH_TOKEN_EXPIRES,
} from "../config/index.js";

const signAcess = (userId) => {
  return jwt.sign({ sub: userId }, JWT_ACCESS_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES,
  });
};
const signRefresh = (userId) => {
  return jwt.sign({ sub: userId }, JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES,
  });
};

export const register = async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Fields are required!" });
    }
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered." });
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashPassword, firstname, lastname },
    });
    const access = signAcess(user.id);
    const refresh = signRefresh(user.id);
    console.log("Access: " + access);
    console.log("Refresh: " + refresh);
    await prisma.refreshToken.create({
      data: { token: refresh, userId: user.id },
    });

    res.cookie("refreshToken", refresh, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      secure:true,
      sameSite:"none",
    });

    res.cookie("accessToken", access, {
      httpOnly: true,
      maxAge: 15 * 60 * 1000, // 15 minutes
      secure:true,
      sameSite:"none",
    });

    return res.json({
      user: { id: user.id, email: user.email, firstname, lastname },
      access,
      refresh,
    });
  } catch (error) {
    return res.status(500).json({ message: `Error: ${error.message}` });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(409).json({ message: "Fields are required" });
    }
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (!existingUser) {
      return res.status(401).json({ message: "User doesnt exist" });
    }
    const checkPassword = await bcrypt.compare(password, existingUser.password);
    if (!checkPassword) {
      return res.status(401).json({ message: "incorrect credentials" });
    }
    const access = signAcess(existingUser.id);
    const refresh = signRefresh(existingUser.id);

    await prisma.refreshToken.deleteMany({ where: { token: refresh } });
    await prisma.refreshToken.create({
      data: { token: refresh, userId: existingUser.id },
    });

    res.cookie("refreshToken", refresh, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      secure:true,
      sameSite:"none",
    });

    res.cookie("accessToken", access, {
      httpOnly: true,
      maxAge: 15 * 60 * 1000, // 15 minutes
      secure:true,
      sameSite:"none",
    });

    return res.status(200).json({
      user: {
        id: existingUser.id,
        email,
        firstname: existingUser.firstname,
        lastname: existingUser.lastname,
      },
      access,
      refresh
    });
  } catch (error) {
    console.log("Error:" + error);
    return res.status(500).json({ message: `Error: ${error.message}` });
  }
};

export const refresh = async (req, res) => {
  try {
    const refreshToken = req.body.refreshToken || req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token" });
    }

    const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET);

    const stored = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!stored) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const access = signAcess(payload.sub);

    res.cookie("accessToken", access, {
      httpOnly: true,
      maxAge: 15 * 60 * 1000,
      secure:true,
      sameSite:"none",
    });

    return res.status(200).json({ access});
  } catch (error) {
    return res.status(401).json({ message: "Refresh failed" });
  }
};

export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(400).json({ message: "No refresh token provided" });
    }
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    return res.status(500).json({ message: `Error: ${error.message}` });
  }
};

export const getMe = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    return res.status(200).json({
      user: req.user,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};
