import * as repo from './reviews.repository.js';

const validateRating = (payload) => {
    if (payload.rating === undefined || payload.rating === null) {
        return [];
    }
    const ratingValue = Number(payload.rating);
    if (!Number.isInteger(ratingValue) || ratingValue < 1 || ratingValue > 5) {
        return ["Đánh giá phải từ 1 đến 5."];
    }
    return [];
};

export const getAll = async (query) => {
    const { cafe_id: cafeId, user_id: userId } = query || {};
    const { data, error } = await repo.findAll(cafeId, userId);
    if (error) throw error;
    return data;
};

export const getById = async(id) => {
    const { data, error} = await repo.findById(id);
    if (error) throw error;
    return data;
};

export const create = async(payload) => {
    const errors = validateRating(payload);
    if (errors.length > 0) {
        throw { status: 400, message: errors[0], errors };
    }
    if (payload.cafe_id && payload.user_id) {
        const { data: existing, error: existingError } = await repo.findAll(payload.cafe_id, payload.user_id);
        if (existingError) throw existingError;
        if (Array.isArray(existing) && existing.length > 0) {
            throw { status: 409, message: 'Bạn đã đánh giá quán này rồi.' };
        }
    }
    const { data, error} = await repo.create(payload);
    if (error) throw error;
    return data;
};

export const update = async (id, payload) => {
    const errors = validateRating(payload);
    if (errors.length > 0) {
        throw { status: 400, message: errors[0], errors };
    }
    const { data, error } = await repo.update(id, payload);
    if (error) throw error;
    return data;
};

export const remove = async (id) => {
    const { data, error } = await repo.remove(id);
    if (error) throw error;
    return data;
};