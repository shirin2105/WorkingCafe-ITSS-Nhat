import * as repo from './cafes.repository.js';

export const getAll = async (query) => {
    const { data, error } = await repo.findAll(query);
    if (error) throw error;
    return data;
};

export const getById = async(id) => {
    const { data, error} = await repo.findById(id);
    if (error) throw error;
    return data;
};

export const getImages = async (cafeId) => {
    const { data, error } = await repo.findImagesByCafeId(cafeId);
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

export const replaceImages = async (id, payload) => {
    const rawImages = Array.isArray(payload?.images) ? payload.images : [];
    const images = rawImages
        .map((imageUrl) => typeof imageUrl === "string" ? imageUrl.trim() : "")
        .filter(Boolean)
        .filter((imageUrl, index, list) => list.indexOf(imageUrl) === index)
        .slice(0, 10);

    if (images.length === 0) {
        throw { status: 400, message: "Vui lòng cung cấp ít nhất một URL ảnh." };
    }

    const { data: cafeData, error: cafeError } = await repo.update(id, { image_url: images[0] });
    if (cafeError) throw cafeError;

    const { data, error } = await repo.replaceImages(id, images);
    if (error) throw error;

    return {
        cafe: Array.isArray(cafeData) ? cafeData[0] : cafeData,
        images: data
    };
};

export const remove = async (id) => {
    const { data, error } = await repo.remove(id);
    if (error) throw error;
    return data;
};
