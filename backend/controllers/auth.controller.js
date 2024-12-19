import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { setToken } from "../utils/setToken.js";
import { sendVerificationEmail } from "../utils/emails.js";
import dotenv from "dotenv";

dotenv.config();

export const signUp = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all fields!",
      });
    }

    // Check if user email already exists
    const emailExist = await User.findOne({ email });

    if (emailExist) {
      return res.status(400).json({
        success: false,
        message: "Email already exists!",
      });
    }

    // Check if user name already exists
    const nameExist = await User.findOne({ name });

    if (nameExist) {
      return res.status(401).json({
        success: false,
        message: "Name already exists!",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save().then((result) => {
      sendVerificationEmail(result, res);
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all fields!",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Email or password is incorrect!",
      });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).json({
        success: false,
        message: "Email or password is incorrect!",
      });
    }

    // Set token
    const token = setToken(res, user._id);

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      ...user._doc,
      password: undefined,
      token,
    });
  } catch (error) {
    next(error);
  }
};
