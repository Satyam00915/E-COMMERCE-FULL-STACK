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
    console.log("Error in Signup Controller");
    res.status(500).json({
      message: error.message,
    });
  }
};

export const signin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await user.comparePassword(password))) {
      const { accessToken, refreshToken } = generateTokens(user._id);

      setCookies(res, accessToken, refreshToken);
      await storeRefreshToken(user._id, refreshToken);

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      res.status(401).json({
        message: "Invalid Credentials",
      });
    }
  } catch (error) {
    console.log("Error in login Controller", error.message);
    res.status(500).json({ message: error.message });
  }
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
    console.log("Error in Logout Controller");
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

//this will refresh the access token
export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshtoken;
    if (!refreshToken) {
      return res.status(401).json({
        message: "No refresh Token found",
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const storedToken = await redis.get(`refresh_token:${decoded.userId}`);

    if (storedToken !== refreshToken) {
      return res.status(401).json({
        message: "Invalid refresh token",
      });
    }

    const accesstoken = jwt.sign(
      { userId: decoded.userId },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "15m",
      }
    );

    res.cookie("accesstoken", accesstoken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    res.json({
      message: "Token refreshed successfully",
    });
  } catch (error) {
    console.log("Error in refreshing token", error.message);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
