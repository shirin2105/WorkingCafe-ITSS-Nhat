import * as repo from './bookings.repository.js';

export const getAll = async() => {
    const { data, error } = await repo.findAll();
    if (error) throw error;
    return data;
};

export const getById = async(id) => {
    const { data, error} = await repo.findById(id);
    if (error) throw error;
    return data;
};

export const create = async(payload) => {
    const { data, error} = await repo.create(payload);
    if (error) throw error;
    return data;
};

export const update = async (id, payload) => {
    const { data, error } = await repo.update(id, payload);
    if (error) throw error;
    return data;
};

export const remove = async (id) => {
    const { data, error } = await repo.remove(id);
    if (error) throw error;
    return data;
};