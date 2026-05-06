import express from "express";
import * as controller from './accounts.controller.js';

const route = express.Router();

route.get('/', controller.getAll);
route.get('/:id', controller.getById);
route.post('/', controller.create);
route.put('/:id', controller.update);
route.delete('/:id', controller.remove);

export default route;