// Regex patterns
const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
const usernameRegex = /^[a-zA-Z0-9_]+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const validateRegisterData = (data) => {
    const { email, username, password, phone, role, cafeName, cafeAddress, openTime, closeTime } = data;
    const errors = [];

    const normalizedEmail = typeof email === 'string' ? email.trim() : '';
    const normalizedUsername = typeof username === 'string' ? username.trim() : '';
    const normalizedPhone = typeof phone === 'string' ? phone.trim() : '';
    const normalizedRole = typeof role === 'string' ? role.trim() : '';
    const normalizedCafeName = typeof cafeName === 'string' ? cafeName.trim() : '';
    const normalizedCafeAddress = typeof cafeAddress === 'string' ? cafeAddress.trim() : '';
    const normalizedOpenTime = typeof openTime === 'string' ? openTime.trim() : '';
    const normalizedCloseTime = typeof closeTime === 'string' ? closeTime.trim() : '';

    if (!normalizedEmail || !emailRegex.test(normalizedEmail)) {
        errors.push('Email không hợp lệ.');
    }
    if (!normalizedUsername || !usernameRegex.test(normalizedUsername)) {
        errors.push('Tên người dùng không hợp lệ (chỉ gồm chữ, số, dấu gạch dưới).');
    }
    if (!password || !passwordRegex.test(password)) {
        errors.push('Mật khẩu phải từ 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.');
    }
    if (!normalizedPhone) {
        errors.push('Số điện thoại là bắt buộc.');
    }
    if (!normalizedRole || (normalizedRole !== 'user' && normalizedRole !== 'owner')) {
        errors.push('Role không hợp lệ.');
    }
    if (normalizedRole === 'owner') {
        if (!normalizedCafeName || !normalizedCafeAddress || !normalizedOpenTime || !normalizedCloseTime) {
            errors.push('Chủ quán cần cung cấp tên quán, địa chỉ và giờ mở cửa/đóng cửa.');
        }
    }

    return errors;
};

export const validateLoginData = (data) => {
    const { identifier, password } = data;
    const errors = [];

    if (!identifier || !password) {
        errors.push('Vui lòng nhập Email/Username và Mật khẩu.');
    }

    return errors;
};
