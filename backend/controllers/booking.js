import Booking from '../models/Booking.js';
import User from '../models/user.js';

export const createBooking = async (req, res) => {
  try {
    const { client, freelancer, serviceType, details, bookingDate, hours, status, paymentStatus, rating, review, timeSlot, price } = req.body;
    console.log("req.body", req.body);
    const clientExists = await User.findById(client);
    const freelancerExists = await User.findById(freelancer);

    if (client === freelancer)
    {
      console.log("Client and Freelancer cannot be the same");
      return res.status(400).json({ message: 'Client and Freelancer cannot be the same' });
    }

    if (!clientExists || !freelancerExists) {
      console.log("Client or Freelancer not found");
      return res.status(404).json({ message: 'Client or Freelancer not found' });
    }


    const newBooking = new Booking({
        client: client ? client : clientExists._id,
        freelancer: freelancer ? freelancer : freelancerExists._id, 
        service: serviceType ? serviceType : '', 
        description: details? details : '', 
        bookingDate, 
        hours, 
        status, 
        paymentStatus: paymentStatus? paymentStatus : 'pending', 
        rating, 
        review, 
        timeSlot, 
        price
    });

    await newBooking.save();
    res.status(201).json({ message: 'Booking created successfully', booking: newBooking });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate('client freelancer', 'firstName lastName email profileImage');
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.find({freelancer:req.params.id}).populate('client freelancer', 'firstName lastName email profileImage');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const getBookingByclientId = async (req, res) => {
  try {
    const booking = await Booking.find({client:req.params.id}).populate('client freelancer', 'firstName lastName email profileImage');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const getBookingByService = async (req, res) => {
  try {
    const booking = await Booking.find({service: req.body.service}).populate('client freelancer', 'firstName lastName email profileImage');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    console.log("req.params.id", req.params.id);
    
    if (!booking) {
      console.log("Booking not found");
      return res.status(404).json({ message: 'Booking not found' });
    }

    console.log("req.body", req.body);

    const { status } = req.body;
    

      booking.status = status ? status : booking.status;

    await booking.save();

    res.status(200).json(booking);
  } catch (error) {
    console.error("Error occured while updating booking");
    res.status(500).json({ message: error.message });
  }
};

export const deleteBooking = async (req, res) => {
  try {
    const deletedBooking = await Booking.findByIdAndDelete(req.params.id);

    if (!deletedBooking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.status(200).json({ message: 'Booking deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
