import User from '../models/user.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cloudinary from '../config/cloudinary.js';

export const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("User already exists");
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role
    });

    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, email: newUser.email }, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );

    const isLocal = process.env.NODE_ENV === 'development';

    res.cookie("jwt", token, {
      httpOnly: true,  
      secure: !isLocal,    
      sameSite: "None",
      path: "/",
      maxAge: 24 * 60 * 60 * 1000,
    }).json({
      _id: newUser._id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      role: newUser.role,
      token
    });
  } catch (error) {
    console.log("Error occured while registering user")
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      console.log("No User Found")
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Password Doesnot match")
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email }, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );

    const isLocal = process.env.NODE_ENV === 'development';

    res.cookie("jwt", token, {
      httpOnly: true,  
      secure: !isLocal,    
      sameSite: "None",
      path: "/",
      maxAge: 24 * 60 * 60 * 1000,
    }).json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      token
    });
  } catch (error) {
    console.log("Error Occured while logging in")
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      console.log("User not found");
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error occured while finding user by id");
    res.status(500).json({ message: 'Server error' });
  }
};

export const getCurrentUser = async (req, res) => {
  
  try {
    if (!req.user) {
      console.log("User not found");
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(req.user);
  } catch (error) {
    console.error("Error occured while getting current user");
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUsersByRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!role) {
      console.log("Role is needed");
      return res.status(404).json({ message: 'Provide the role' });
    }
    const user = await User.find({role: role})

    if(!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error occured while getting user");
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.error("Error occured while getting all users");
    res.status(500).json({ message: 'Server error' });
  }
}

export const updateUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      console.log("User not found");
      return res.status(404).json({ message: 'User not found' });
    }

    console.log("req.body", req.body);

    const { firstName, lastName, email, role, isAdmin,
      bio, profilePicture, skills, experience, hourlyRate, 
      availability, location, phoneNumber, website, languages, education, birthDate, categories } = req.body;
    

      user.firstName = firstName || user.firstName;
      user.lastName = lastName || user.lastName;
      user.email = email || user.email;
      user.role = role || user.role;
      user.isAdmin = isAdmin || user.isAdmin;
      user.bio = bio || user.bio;
      user.profilePicture = profilePicture || user.profilePicture;
      user.skills = skills || user.skills;
      user.experience = experience || user.experience;
      user.hourlyRate = hourlyRate || user.hourlyRate;
      user.availability = availability || user.availability;
      user.location = location || user.location;
      user.phoneNumber = phoneNumber || user.phoneNumber;
      user.website = website || user.website;
      user.languages = languages || user.languages;
      user.education = education || user.education;
      user.birthDate = birthDate || user.birthDate;
      user.categories = categories || user.categories;

    await user.save();

    res.status(200).json(user);
  } catch (error) {
    console.error("Error occured while updating user");
    res.status(500).json({ message: error.message });
  }
}

export const deleteUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      console.log("User not found");
      return res.status(404).json({ message: 'User not found' });
    }

    await user.remove();
    res.status(200).json({ message: 'User removed' });
  } catch (error) {
    console.error("Error occured while deleting user");
    res.status(500).json({ message: 'Server error' });
  }
}

export const uploadImage = async (req, res) => {
  const userId = req.params.id;
  const profileImage = req.file ? `/uploads/${req.file.filename}` : "";

  console.log(req.file)
  try {
    if (!profileImage) {
      return res.status(400).json({ message: "No profile picture uploaded" });
    }
    const imageFilePath = req.file.path;
    const result = await cloudinary.uploader.upload(imageFilePath, {
      folder: "sewadoot",
      resource_type: "image"
    });
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profileImage: result.secure_url },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (err) {
    console.error("Error updating profile picture:", err);
    res.status(500).json({ message: "Error updating profile picture" });
  }
};
