import { supabase } from '../../config/db.js';

const TABLE = "cafes";

export const findAll = async (query) => {
    const keyword = typeof query?.keyword === "string" ? query.keyword.trim() : "";
    const city = typeof query?.city === "string" ? query.city.trim() : "";
    const time = typeof query?.time === "string" ? query.time.trim() : "";
    const ownerId = typeof query?.owner_id === "string" ? query.owner_id.trim() : "";
    const featureIds = typeof query?.feature_ids === "string"
        ? query.feature_ids.split(",").map((value) => Number(value)).filter((value) => !Number.isNaN(value))
        : [];

    const selectClause = featureIds.length > 0
        ? "*, cafe_features!inner(feature_id, features(name))"
        : "*, cafe_features(feature_id, features(name))";

    let dbQuery = supabase.from(TABLE).select(selectClause);

    if (keyword) {
        const safeKeyword = keyword.replace(/[%]/g, "");
        dbQuery = dbQuery.or(
            `name.ilike.%${safeKeyword}%,address.ilike.%${safeKeyword}%,city.ilike.%${safeKeyword}%`
        );
    }

    if (city) {
        dbQuery = dbQuery.eq("city", city);
    }

    if (ownerId) {
        dbQuery = dbQuery.eq("owner_id", Number(ownerId));
    }

    if (time) {
        dbQuery = dbQuery.lte("open_time", time).gte("close_time", time);
    }

    if (featureIds.length > 0) {
        dbQuery = dbQuery.in("cafe_features.feature_id", featureIds);
    }

    return await dbQuery;
};

export const findById = async (id) => {
    return await supabase
        .from(TABLE)
        .select()
        .eq("id", id)
        .single();
};

export const create = async (payload) => {
    return await supabase.from(TABLE).insert(payload).select();
};

export const update = async (id, payload) => {
    return await supabase
        .from(TABLE)
        .update(payload)
        .eq("id", Number(id))
        .select();
};

export const remove = async (id) => {
    return await supabase
        .from(TABLE)
        .delete()
        .eq("id", Number(id));
};