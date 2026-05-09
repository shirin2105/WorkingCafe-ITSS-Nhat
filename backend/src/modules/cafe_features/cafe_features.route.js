import express from "express";
import * as controller from "./cafe_features.controller.js";

const route = express.Router();

route.get("/", controller.getAll);
route.post("/", controller.create);
route.delete("/:cafeId/:featureId", controller.remove);

export default route;
