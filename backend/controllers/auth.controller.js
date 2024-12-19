import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { setToken } from "../utils/setToken.js";
import { sendVerificationEmail } from "../utils/emails.js";
import dotenv from "dotenv";
import UserVerification from "../models/user.verification.model.js";
import path, { dirname, join } from "path";
import { fileURLToPath } from "url";

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

export const verifyEmail = async (req, res, next) => {
  const { userId, uniqueString } = req.params;

  const userVerification = await UserVerification.findOne({ userId });
  if (!userVerification) {
    return res.redirect(
      "http://localhost:5173/api/v1/auth/verifiedEmail?error=true&message=Email%20verified%20or%20link%20expired"
    );
  }

  const isMatch = bcrypt.compare(uniqueString, userVerification.uniqueString);
  if (!isMatch) {
    return res.redirect(
      "http://localhost:5173/api/v1/auth/verifiedEmail?error=true&message=Link%20expired.%20Please%20resend%20a%20new%20verification."
    );
  }

  const user = await User.findById(userId);
  user.isVerified = true;
  await user.save();
  await userVerification.deleteOne();
  res.redirect("http://localhost:5000/api/auth/verifiedEmail");
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const verifiedEmail = (req, res) => {
  res.sendFile(path.join(__dirname, "../views/verified.html"));
};
