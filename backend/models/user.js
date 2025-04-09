import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['client', 'freelancer'],
    required: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  bio: {
    type: String,
    trim: true,
    default: 'Hello I am SewaDoot User'
  },
  skills: [{
    name: {
      type: String,
      trim: true,
    },
  }],
  birthDate: {
    type: Date
  },
  availability: {
    type: String,
    default: 'Part-time'
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  languages: [{
    type: String,
    trim: true
  }],
  profileImage: {
    type: String,
    default: 'default-profile.png'
  },
  hourlyRate: {
    type: Number,
    min: 0,
    default: 100
  },
  location: {
    type: String,
    trim: true,
    default: 'Earth'
  },
  categories: [{
    type: String,
    default: 'General'
  }],
  portfolio: [{
    type: String
  }],
  dateJoined: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  },
  projectCount: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  active: {
    type: Boolean,
    default: true
  },
  respond: {
    type: String,
    default: 'Frequently',
  },
  experience: {
    type: String,
    default: 'Beginner'
  },
  education: {
    type: String,
    default: 'High School'
  },
  certification: {
    type: String,
    default: 'None'
  },
});

const User = mongoose.model('User', userSchema);

export default User;
