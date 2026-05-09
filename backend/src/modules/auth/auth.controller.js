import * as service from './auth.service.js';
import { validateRegisterData, validateLoginData } from '../../utils/validators.js';

export const register = async (req, res) => {
    try {
        const errors = validateRegisterData(req.body);
        if (errors.length > 0) {
            return res.status(400).json({ message: errors[0], errors });
        }

        const data = await service.register(req.body);
        res.status(201).json(data);
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message || 'Lỗi hệ thống', error: err.error });
    }
};

export const login = async (req, res) => {
    try {
        const errors = validateLoginData(req.body);
        if (errors.length > 0) {
            return res.status(400).json({ message: errors[0] });
        }
        
        const { identifier, password } = req.body;

        const data = await service.login(identifier, password);
        res.json(data);
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message || 'Lỗi hệ thống' });
    }
};
