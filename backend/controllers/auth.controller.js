import { generateTokens } from "../lib/generateToken.js";
import { redis } from "../lib/redis.js";
import { setCookies } from "../lib/setCookies.js";
import { storeRefreshToken } from "../lib/storeTokens.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const signup = async (req, res) => {
  const { email, password, name } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        message: "User already Exists",
      });
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    //authenticate

    const { accessToken, refreshToken } = generateTokens(user._id);
    await storeRefreshToken(user._id, refreshToken);

    setCookies(res, accessToken, refreshToken);

    res.status(201).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      message: "User Created Successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const signin = async (req, res) => {
  res.json({
    message: "Sign In Route",
  });
};

export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshtoken;
    if (refreshToken) {
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );

      await redis.del(`refresh_token:${decoded.userId}`);
    }

    res.clearCookie("accesstoken");
    res.clearCookie("refreshtoken");
    res.json({
      message: "Logged Out Successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
