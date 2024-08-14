// const express = require('express');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
// const nodemailer = require('nodemailer');
// const User = require('../Models/userModel');
// const router = express.Router();
// const crypto = require('crypto');
// require('dotenv').config();

// router.use(express.json());

// // express bcrypt jsonwebtoken nodemailer crypto

// // Signup route
// router.post('/signup', async (req, res) => {
//   const { username, email, password, repeatPassword } = req.body;

//   if (password !== repeatPassword) {
//     return res.status(400).json({ message: 'Passwords do not match' });
//   }

//   try {
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ message: 'User already exists' });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const newUser = new User({ username, email, password: hashedPassword, repeatPassword: hashedPassword });

//     await newUser.save();
//     res.json({ status: true, message: 'User created successfully' });
//   } catch (error) {
//     console.error('Error during signup:', error);
//     res.status(500).json({ message: 'Error creating user', error: error.message });
//   }
// });

// // Login route
// router.post('/login', async (req, res) => {
//     const { email, password } = req.body;
//     try {
//       const user = await User.findOne({ email });
//       if (!user) {
//         return res.status(401).json({ message: 'User not found' });
//       }
  
//       const isPasswordCorrect = await bcrypt.compare(password, user.password);
//       if (!isPasswordCorrect) {
//         return res.status(401).json({ message: 'Invalid password' });
//       }
      
//       // Generate JWT token
//       const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: '1h' });
      
//       res.json({ token, username: user.username });
//     } catch (err) {
//       res.status(500).json({ message: 'Error logging in' });
//     }
//   });

// // forgot-password route 
//   router.post('/forgot-password', async (req, res) => {
//     const { email } = req.body;
  
//     try {
//       const user = await User.findOne({ email });
//       if (!user) {
//         return res.status(404).json({ message: 'User not registered' });
//       }
  
//       const token = crypto.randomBytes(20).toString('hex');
//       user.resetToken = token;
//       user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
//       await user.save();
  
//       const transporter = nodemailer.createTransport({
//         service: 'gmail',
//         auth: {
//           user: 'sudhandev22@gmail.com',
//           pass: 'ajbhwbmaqnjveloc',
//         },
//         tls: { rejectUnauthorized: false },
//       });
  
//       const mailOptions = {
//         from: 'sudhandev22@gmail.com',
//         to: email,
//         subject: 'Reset Password',
//         text: `Click the following link to reset your password: https://forget-password-fe-five.vercel.app/reset-password/${token}`,
//       };
  
//       transporter.sendMail(mailOptions, (error, info) => {
//         if (error) {
//           console.error('Error sending email:', error);
//           return res.status(500).json({ message: 'Failed to send password reset email' });
//         } else {
//           // console.log('Password reset email sent:', info.response);
//           return res.status(200).json({ message: 'Password reset email sent successfully' });
//         }
//       });
//     } catch (error) {
//       console.error('Error occurred:', error);
//       return res.status(500).json({ message: 'Internal server error', error: error.message });
//     }
//   });

// // reset-password route
// router.post('/reset-password/:token', async (req, res) => {
//   const { token } = req.params;
//   const { password, repeatPassword } = req.body;

//   // console.log('Received token:', token);
//   // console.log('Received passwords:', password, repeatPassword);

//   if (!password || !repeatPassword) {
//     return res.status(400).json({ message: 'Password and repeat password are required' });
//   }

//   if (password !== repeatPassword) {
//     return res.status(400).json({ message: 'Passwords do not match' });
//   }

//   try {
//     const user = await User.findOne({
//       resetToken: token,
//       resetTokenExpiry: { $gt: Date.now() }
//     });

//     // console.log('Found user:', user);

//     if (!user) {
//       return res.status(400).json({ message: 'Invalid or expired reset token' });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);
//     user.password = hashedPassword;
//     user.repeatPassword = hashedPassword;
//     user.resetToken = undefined;
//     user.resetTokenExpiry = undefined;
//     await user.save();

//     return res.status(200).json({ status: true, message: 'Password reset successfully.' });
//   } catch (error) {
//     console.error('Error occurred while resetting password:', error);
//     return res.status(500).json({ status: false, message: 'Failed to reset password. Please try again later.' });
//   }
// });


// module.exports = router;
const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// Replace with your secret key
const JWT_SECRET = 'your_jwt_secret_key';

// Forget Password - Send Reset Token
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User with this email does not exist' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        await user.save();

        const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;

        // Send email
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'your-email@gmail.com',
                pass: 'your-email-password'
            }
        });

        const mailOptions = {
            to: user.email,
            from: 'your-email@gmail.com',
            subject: 'Password Reset',
            text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
            Please click on the following link, or paste this into your browser to complete the process:\n\n
            ${resetUrl}\n\n
            If you did not request this, please ignore this email and your password will remain unchanged.\n`
        };

        transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'Password reset link sent to email' });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Reset Password - Update Password
router.post('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    try {
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.status(200).json({ message: 'Password has been updated' });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Login User
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User does not exist' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ token });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

module.exports = router;
