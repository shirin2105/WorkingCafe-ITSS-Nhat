import * as repo from './bookings.repository.js';
import * as notificationRepo from '../notifications/notifications.repository.js';

const STATUS_VALUES = new Set(["pending", "approved", "cancelled"]);

const parseTimeToMinutes = (value) => {
    if (typeof value !== "string") return null;
    const match = value.match(/^(\d{2}):(\d{2})$/);
    if (!match) return null;
    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    if (hours > 23 || minutes > 59) return null;
    return hours * 60 + minutes;
};

const validateBookingPayload = (payload) => {
    const errors = [];

    if (payload.booking_date) {
        const bookingDate = new Date(payload.booking_date);
        if (Number.isNaN(bookingDate.getTime())) {
            errors.push("Ngày đặt chỗ không hợp lệ.");
        } else {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const maxDate = new Date(today);
            maxDate.setDate(maxDate.getDate() + 90);
            if (bookingDate < today || bookingDate > maxDate) {
                errors.push("Ngày đặt chỗ phải từ hôm nay đến 90 ngày tới.");
            }
        }
    }

    if (payload.booking_time) {
        const minutes = parseTimeToMinutes(payload.booking_time);
        if (minutes === null) {
            errors.push("Giờ đặt chỗ không hợp lệ.");
        } else {
            const minTime = 8 * 60;
            const maxTime = 21 * 60;
            if (minutes < minTime || minutes > maxTime || minutes % 30 !== 0) {
                errors.push("Giờ đặt chỗ phải từ 08:00 đến 21:00, cách nhau 30 phút.");
            }
        }
    }

    if (payload.number_of_people !== undefined && payload.number_of_people !== null) {
        const people = Number(payload.number_of_people);
        if (!Number.isInteger(people) || people < 1 || people > 10) {
            errors.push("Số người phải từ 1 đến 10.");
        }
    }

    if (payload.status && !STATUS_VALUES.has(payload.status)) {
        errors.push("Trạng thái đặt chỗ không hợp lệ.");
    }

    return errors;
};

export const getAll = async (query) => {
    const { user_id: userId, cafe_id: cafeId, status } = query || {};
    const { data, error } = await repo.findAll(userId, cafeId, status);
    if (error) throw error;
    return data;
};

export const getById = async(id) => {
    const { data, error} = await repo.findById(id);
    if (error) throw error;
    return data;
};

export const create = async(payload) => {
    const cleanPayload = { ...payload };
    delete cleanPayload.id;
    const errors = validateBookingPayload(payload);
    if (errors.length > 0) {
        throw { status: 400, message: errors[0], errors };
    }
    const { data, error} = await repo.create(cleanPayload);
    if (error) throw error;
    const created = Array.isArray(data) ? data[0] : data;

    if (created?.cafe_id) {
        const { data: cafeData } = await repo.findCafeOwnerId(created.cafe_id);
        if (cafeData?.owner_id) {
            await notificationRepo.create({
                user_id: cafeData.owner_id,
                content: `Booking #${created.id} - ${created.booking_date} ${created.booking_time} - ${created.number_of_people} người`,
                is_read: false
            });
        }
    }

    return created;
};

export const update = async (id, payload) => {
    const errors = validateBookingPayload(payload);
    if (errors.length > 0) {
        throw { status: 400, message: errors[0], errors };
    }
    const { data: previous, error: previousError } = await repo.findById(id);
    if (previousError) throw previousError;
    const { data, error } = await repo.update(id, payload);
    if (error) throw error;
    const updated = Array.isArray(data) ? data[0] : data;

    if (payload.status && previous?.status !== payload.status && updated?.user_id) {
        const statusLabel = payload.status === 'approved'
            ? 'đã được duyệt'
            : payload.status === 'cancelled'
                ? 'đã bị từ chối'
                : payload.status;
        await notificationRepo.create({
            user_id: updated.user_id,
            content: `Booking #${updated.id} ${statusLabel}.`,
            is_read: false
        });
    }
    return data;
};

export const remove = async (id) => {
    const { data, error } = await repo.remove(id);
    if (error) throw error;
    return data;
};