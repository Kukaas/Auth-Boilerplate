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
    const url = `http://localhost:5000/api/auth/verify/${uniqueString}/${userId}`;

    // Create email options
    const mailOptions = {
      from: process.env.AUTH_EMAIL,
      to: user.email,
      subject: "Account Verification",
      html: `
        <!DOCTYPE html>
          <html>
          <head>
          <link
            href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap"
            rel="stylesheet"
          />
              <style>
                  body {
                      font-family: "Poppins", sans-serif;
                      background-color: #f9f9f9;
                      margin: 0;
                      padding: 0;
                      color: #333;
                      display: flex;
                      justify-content: center;
                      align-items: center;
                      min-height: 100vh;
                  }

                  .container {
                      max-width: 600px;
                      margin: 20px;
                      padding: 20px;
                      background-color: #ffffff;
                      border-radius: 10px;
                      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
                      text-align: center;
                      width: 90%;
                  }

                  h1 {
                      color: #007bff;
                      font-size: 24px;
                      margin-bottom: 20px;
                  }

                  h2 {
                      color: #555;
                      font-size: 20px;
                      margin-bottom: 20px;
                  }

                  p {
                      font-size: 16px;
                      line-height: 1.6;
                      margin-bottom: 20px;
                  }

                  .button-link {
                      display: inline-block;
                      text-decoration: none;
                      background-color: #e0e0e0;
                      color: black;
                      padding: 12px 25px;
                      font-size: 16px;
                      font-weight: bold;
                      border-radius: 5px;
                      transition: background-color 0.3s ease;
                  }

                  .button-link:hover {
                      background-color: #c7c7c7;
                  }

                  @media (max-width: 600px) {
                      h1 {
                          font-size: 20px;
                      }

                      h2 {
                          font-size: 18px;
                      }

                      p {
                          font-size: 14px;
                      }

                      .button-link {
                          font-size: 14px;
                          padding: 10px 20px;
                      }
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
