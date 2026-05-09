import * as repo from "./favorites.repository.js";

export const getAll = async (query) => {
  const { user_id: userId, cafe_id: cafeId } = query || {};
  const { data, error } = await repo.findAll(userId, cafeId);
  if (error) throw error;
  return data;
};

export const create = async (payload) => {
  const { data, error } = await repo.create(payload);
  if (error) throw error;
  return data;
};

export const remove = async (userId, cafeId) => {
  const { data, error } = await repo.remove(userId, cafeId);
  if (error) throw error;
  return data;
};
