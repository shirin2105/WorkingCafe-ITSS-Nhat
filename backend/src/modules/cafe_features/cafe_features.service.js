import * as repo from "./cafe_features.repository.js";

export const getAll = async (query) => {
  const { cafe_id: cafeId, feature_id: featureId } = query || {};
  const { data, error } = await repo.findAll(cafeId, featureId);
  if (error) throw error;
  return data;
};

export const create = async (payload) => {
  const { data, error } = await repo.create(payload);
  if (error) throw error;
  return data;
};

export const remove = async (cafeId, featureId) => {
  const { data, error } = await repo.remove(cafeId, featureId);
  if (error) throw error;
  return data;
};
