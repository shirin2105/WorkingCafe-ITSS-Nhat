import express from "express";
import cors from "cors";

import accountRoutes from './modules/accounts/accounts.route.js';
import bookingRoutes from './modules/bookings/bookings.route.js';
import cafeRoutes from './modules/cafes/cafes.route.js';
import itemRoutes from './modules/items/items.route.js';
import reviewRoutes from './modules/reviews/reviews.route.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (_, res) => 
    res.json({ info: "Welcome to WorkingCafe" })
);

app.use('/accounts', accountRoutes);
app.use('/bookings', bookingRoutes);
app.use('/cafes', cafeRoutes);
app.use('/items', itemRoutes);
app.use('/reviews', reviewRoutes);

export default app;