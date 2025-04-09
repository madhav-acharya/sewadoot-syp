import jwt from 'jsonwebtoken';
import User from '../models/user.js';

export const protect = async (req, res, next) => {
  let token;
  if (req?.headers?.authorization && req?.headers?.authorization?.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        console.log("User not found")
        return res.status(404).json({ message: 'User not found' });
      }
      next();
    } catch (error) {
      console.log("Error Occured while verifying token")
      console.error(error);

      if (error.name === 'JsonWebTokenError') {
        console.log("Invalid Token");
        return res.status(401).json({ message: 'Not authorized, invalid token' });
      }

      if (error.name === 'TokenExpiredError') {
        console.log("Token Expired");
        return res.status(401).json({ message: 'Not authorized, token has expired' });
      }
      console.log("Token Verification Failed");
      return res.status(500).json({ message: 'Not authorized, token verification failed' });
    }
  }

  if (!token) {
    console.log("No Token Provided");
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};
