import jwt from 'jsonwebtoken';
import * as cafeRepo from '../modules/cafes/cafes.repository.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

export const authenticate = (req, res, next) => {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) {
        return res.status(401).json({ message: 'Thiếu token.' });
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        return next();
    } catch (error) {
        return res.status(401).json({ message: 'Token không hợp lệ.' });
    }
};

export const requireOwnerRole = (req, res, next) => {
    if (!req.user || req.user.role !== 'owner') {
        return res.status(403).json({ message: 'Chỉ chủ quán mới được phép.' });
    }
    req.body.owner_id = req.user.id;
    return next();
};

export const requireCafeOwner = async (req, res, next) => {
    const cafeId = req.params.id;
    const { data, error } = await cafeRepo.findById(cafeId);
    if (error || !data) {
        return res.status(404).json({ message: 'Không tìm thấy quán.' });
    }
    if (!req.user || Number(data.owner_id) !== Number(req.user.id)) {
        return res.status(403).json({ message: 'Không có quyền chỉnh sửa quán này.' });
    }
    return next();
};
