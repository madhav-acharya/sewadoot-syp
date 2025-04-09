import express from 'express';
import { 
    registerUser,
    loginUser,
    getAllUsers,
    getUserById,
    getCurrentUser,
    updateUserById,
    deleteUserById,
    uploadImage
} from '../controllers/user.js';
import { protect } from '../middlewares/authMiddleware.js';
import upload from "../middlewares/multer.js";

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/get', getAllUsers);
router.get('/get/currentUser', protect, getCurrentUser);
router.get('/get/:id', getUserById);
router.put('/update/:id', updateUserById);
router.put('/update/image/:id', upload.single("profilePicture"), uploadImage);
router.delete('/delete/:id', protect, deleteUserById);

export default router;