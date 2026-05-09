import { supabase } from '../../config/db.js';

const TABLE = "bookings";

export const findAll = async (userId, cafeId, status) => {
    let query = supabase.from(TABLE).select();
    if (userId) {
        query = query.eq("user_id", Number(userId));
    }
    if (cafeId) {
        query = query.eq("cafe_id", Number(cafeId));
    }
    if (status) {
        query = query.eq("status", status);
    }
    return await query;
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

export const findCafeOwnerId = async (cafeId) => {
    return await supabase
        .from('cafes')
        .select('owner_id')
        .eq('id', Number(cafeId))
        .single();
};