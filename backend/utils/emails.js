import bcrypt from "bcryptjs";
import crypto from "crypto";
import UserVerification from "../models/user.verification.model.js";
import nodemailer from "nodemailer";

export const sendVerificationEmail = async (user, res) => {
  const userId = user._id;
  const uniqueString = crypto.randomBytes(15).toString("hex");
  const hashedString = await bcrypt.hash(uniqueString, 10);

  const verification = new UserVerification({
    userId,
    uniqueString: hashedString,
    createdAt: new Date(),
    expireAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
  });

  try {
    // Save the verification record in the database
    const savedVerification = await verification.save();

    // Construct the verification URL
    const url = `http://localhost:5000/api/verify/${uniqueString}/${userId}`;

    // Create email options
    const mailOptions = {
      from: process.env.AUTH_EMAIL,
      to: user.email,
      subject: "Account Verification",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
            body {
                font-family: Arial, sans-serif;
                color: #333;
                margin: 0;
                padding: 0;
            }

            h1 {
                text-align: center;
                color: #444;
            }

            h2 {
                text-align: center;
                color: #555;
            }

            p {
                text-align: center;
                font-size: 16px;
                line-height: 1.5;
            }

            .button-link {
                display: inline-block;
                text-decoration: none;
                background-color: #007bff;
                color: #fff;
                padding: 10px 20px;
                font-size: 16px;
                border-radius: 5px;
                margin: 20px auto;
                text-align: center;
            }

            .button-link:hover {
                background-color: #0056b3;
            }

            .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                text-align: center;
                background-color: #fff;
            }
            </style>
        </head>
        <body>
            <div class="container">
            <h1>Email Verification</h1>
            <h2>Hello ${user.name}</h2>
            <p>Thank you for registering on our website. Please click on the link below to verify your account:</p>
            <a href="${url}" class="button-link">Verify Your Account</a>
            <p>If you did not register on our website, please ignore this email.</p>
            </div>
        </body>
        </html>
      `,
    };

    // Create a Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail", // Use your email provider
      auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASSWORD,
      },
    });

    // Send the email
    await transporter.sendMail(mailOptions);

    // Respond with success only after email is sent
    return res
      .status(201)
      .json({ message: "Verification email sent successfully." });
  } catch (error) {
    console.error("Error sending verification email:", error);

    // Clean up if saving or email fails
    try {
      await UserVerification.deleteOne({ userId, uniqueString: hashedString });
    } catch (cleanupError) {
      console.error("Error during cleanup:", cleanupError);
    }

    // Ensure only one response is sent
    return res
      .status(500)
      .json({ message: "Failed to send verification email." });
  }
};
