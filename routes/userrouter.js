const express = require('express');
const userControllers = require('../controllers/userControllers');
const AuthController = require('../controllers/AuthenticationController');

const router = express.Router();

router.post('/signup', AuthController.signup);
router.post('/login', AuthController.login);
router.post('/forgotPassword', AuthController.forgotPassword);
router.patch('/resetPassword/:token', AuthController.resetPassword);

router.use(AuthController.protect);

router.get('/Me', userControllers.getMe, userControllers.getUser);

router.patch('/updateMyPassword', AuthController.updatePassword);

router.patch('/updateMe', userControllers.updateMe);

router.delete('/deleteMe', userControllers.deleteMe);

router.use(AuthController.restrictTo('admin')); //FIXME:

router
    .route('/')
    .get(userControllers.getAllUsers)
    .post(userControllers.creatUser);

router
    .route('/:id')
    .get(userControllers.getUser)
    .patch(userControllers.updateUser)
    .delete(userControllers.deleteUser);

module.exports = router;
