import express from 'express';
import { 
  createBooking, 
  getAllBookings, 
  getBookingById, 
  updateBooking, 
  deleteBooking 
} from '../controllers/booking.js';

const router = express.Router();

router.post('/', createBooking);
router.get('/get', getAllBookings);
router.get('/get/:id', getBookingById);
router.put('/update/:id', updateBooking);
router.delete('/delete/:id', deleteBooking);

export default router;
