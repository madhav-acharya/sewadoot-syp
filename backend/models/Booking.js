import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true
  },
  freelancer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true
  },
  service: {
    type: String,
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'in progress', 'completed', 'canceled'],
    default: 'pending'
  },
  bookingDate: {
    type: Date,
    required: true
  },
  completionDate: {
    type: Date
  },
  price: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  review: {
    type: String,
    trim: true
  }
}, { timestamps: true });

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
