import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as repo from './auth.repository.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

export const register = async (payload) => {
    const { email, username, password, phone, role, cafeName, cafeAddress, openTime, closeTime } = payload;
    const normalizedEmail = typeof email === 'string' ? email.trim() : '';
    const normalizedUsername = typeof username === 'string' ? username.trim() : '';
    const normalizedPhone = typeof phone === 'string' ? phone.trim() : '';
    const roleValue = typeof role === 'string' ? role.trim() : '';
    const normalizedRole = roleValue === 'owner' ? 'owner' : 'user';
    const normalizedCafeName = typeof cafeName === 'string' ? cafeName.trim() : '';
    const normalizedCafeAddress = typeof cafeAddress === 'string' ? cafeAddress.trim() : '';
    const normalizedOpenTime = typeof openTime === 'string' ? openTime.trim() : '';
    const normalizedCloseTime = typeof closeTime === 'string' ? closeTime.trim() : '';

    // Check if email exists
    const { data: existingEmail } = await repo.findByEmail(normalizedEmail);
    if (existingEmail) {
        throw { status: 400, message: 'Email đã được sử dụng' };
    }

    // Check if username exists
    const { data: existingUser } = await repo.findByUsername(normalizedUsername);
    if (existingUser) {
        throw { status: 400, message: 'Tên người dùng đã tồn tại' };
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create account
    const accountData = {
        email: normalizedEmail,
        username: normalizedUsername,
        password: hashedPassword,
        phone: normalizedPhone,
        role: normalizedRole,
    };

    const { data: account, error: accountError } = await repo.createAccount(accountData);
    if (accountError) throw { status: 500, message: 'Lỗi tạo tài khoản', error: accountError };
    if (!account || !account.id) {
        throw { status: 500, message: 'Không lấy được thông tin tài khoản sau khi tạo' };
    }

    // If owner, create cafe
    if (accountData.role === 'owner') {
        if (!normalizedCafeName || !normalizedCafeAddress || !normalizedOpenTime || !normalizedCloseTime) {
            await repo.deleteAccountById(account.id);
            throw { status: 400, message: 'Thiếu thông tin quán cafe cho tài khoản chủ quán' };
        }

        const cafeData = {
            owner_id: account.id,
            name: normalizedCafeName,
            address: normalizedCafeAddress,
            open_time: normalizedOpenTime,
            close_time: normalizedCloseTime,
        };

        const { data: cafe, error: cafeError } = await repo.createCafe(cafeData);
        if (cafeError) {
            await repo.deleteAccountById(account.id);
            throw { status: 500, message: 'Lỗi tạo quán cafe', error: cafeError };
        }

        return { message: 'Đăng ký thành công', accountId: account.id, cafeId: cafe?.id };
    }

    return { message: 'Đăng ký thành công', accountId: account.id };
};

export const login = async (identifier, password) => {
    // identifier can be email or username
    let account = null;
    if (identifier.includes('@')) {
        const res = await repo.findByEmail(identifier);
        account = res.data;
    } else {
        const res = await repo.findByUsername(identifier);
        account = res.data;
    }

    if (!account) {
        throw { status: 404, message: 'Không tìm thấy tài khoản' };
    }

    // Check password
    const validPassword = await bcrypt.compare(password, account.password);
    if (!validPassword) {
        throw { status: 400, message: 'Mật khẩu không đúng' };
    }

    // Create token
    const token = jwt.sign(
        { id: account.id, role: account.role, username: account.username },
        JWT_SECRET,
        { expiresIn: '24h' }
    );

    return { token, user: { id: account.id, username: account.username, role: account.role } };
};
