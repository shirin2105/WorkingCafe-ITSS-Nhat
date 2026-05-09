import express from 'express';

import accountRoutes from '../modules/accounts/accounts.route.js';
import bookingRoutes from '../modules/bookings/bookings.route.js';
import cafeRoutes from '../modules/cafes/cafes.route.js';
import cafeFeatureRoutes from '../modules/cafe_features/cafe_features.route.js';
import itemRoutes from '../modules/items/items.route.js';
import menuReviewRoutes from '../modules/menu_reviews/menu_reviews.route.js';
import reviewRoutes from '../modules/reviews/reviews.route.js';
import authRoutes from '../modules/auth/auth.route.js';
import featureRoutes from '../modules/features/features.route.js';
import favoriteRoutes from '../modules/favorites/favorites.route.js';
import notificationRoutes from '../modules/notifications/notifications.route.js';

const router = express.Router();

router.use('/accounts', accountRoutes);
router.use('/bookings', bookingRoutes);
router.use('/cafes', cafeRoutes);
router.use('/cafe-features', cafeFeatureRoutes);
router.use('/items', itemRoutes);
router.use('/menu-reviews', menuReviewRoutes);
router.use('/reviews', reviewRoutes);
router.use('/auth', authRoutes);
router.use('/features', featureRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/notifications', notificationRoutes);

export default router;
