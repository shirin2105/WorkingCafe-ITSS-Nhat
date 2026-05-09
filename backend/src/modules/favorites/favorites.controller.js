import * as service from "./favorites.service.js";

export const getAll = async (req, res) => {
  try {
    const data = await service.getAll(req.query);
    res.json(data);
  } catch (err) {
    res.status(500).json(err);
  }
};

export const create = async (req, res) => {
  try {
    const data = await service.create(req.body);
    res.status(201).json(data);
  } catch (err) {
    res.status(400).json(err);
  }
};

export const remove = async (req, res) => {
  try {
    const data = await service.remove(req.params.userId, req.params.cafeId);
    res.json(data);
  } catch (err) {
    res.status(400).json(err);
  }
};
