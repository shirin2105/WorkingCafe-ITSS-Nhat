import express from "express";
import * as controller from './cafes.controller.js';
import { authenticate, requireCafeOwner, requireOwnerRole } from '../../middleware/auth.js';

const route = express.Router();

route.get('/', controller.getAll);
route.get('/:id', controller.getById);
route.post('/', authenticate, requireOwnerRole, controller.create);
route.put('/:id', authenticate, requireCafeOwner, controller.update);
route.delete('/:id', authenticate, requireCafeOwner, controller.remove);

export default route;