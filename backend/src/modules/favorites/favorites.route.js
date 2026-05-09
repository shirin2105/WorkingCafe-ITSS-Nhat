import express from "express";
import * as controller from "./favorites.controller.js";

const route = express.Router();

route.get("/", controller.getAll);
route.post("/", controller.create);
route.delete("/:userId/:cafeId", controller.remove);

export default route;
