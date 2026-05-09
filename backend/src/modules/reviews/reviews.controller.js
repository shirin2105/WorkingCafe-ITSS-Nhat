import * as service from './reviews.service.js';

export const getAll = async (req, res) => {
    try {
    const data = await service.getAll(req.query);
        res.json(data);
    } catch (err) {
        res.status(500).json(err);
    }
};

export const getById = async (req, res) => {
    try {
        const data = await service.getById(req.params.id);
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

export const update = async (req, res) => {
  try {
    const data = await service.update(req.params.id, req.body);
    res.json(data);
  } catch (err) {
    res.status(400).json(err);
  }
};

export const remove = async (req, res) => {
  try {
    const data = await service.remove(req.params.id);
    res.json(data);
  } catch (err) {
    res.status(400).json(err);
  }
};