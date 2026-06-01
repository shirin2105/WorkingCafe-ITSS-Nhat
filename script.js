document.addEventListener('DOMContentLoaded', () => {
    // Signup Form Logic
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        const roleRadios = document.querySelectorAll('input[name="role"]');
        const ownerFields = document.getElementById('ownerFields');

        // Function to toggle the visibility of owner fields
        function toggleOwnerFields() {
            const selectedRole = document.querySelector('input[name="role"]:checked').value;
            if (selectedRole === 'owner') {
                ownerFields.classList.remove('hidden');
            } else {
                ownerFields.classList.add('hidden');
            }
        }

        // Add event listeners to radio buttons
        roleRadios.forEach(radio => {
            radio.addEventListener('change', toggleOwnerFields);
        });

        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Collect form data
            const identifier = document.getElementById('emailOrUsername').value;
            let email = '', username = '';
            if (identifier.includes('@')) {
                email = identifier;
                username = identifier.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '');
            } else {
                username = identifier;
                email = identifier + '@placeholder.com'; // Fallback for DB NOT NULL constraint
            }

            const password = document.getElementById('password').value;
            const phone = document.getElementById('phoneNumber').value;
            
            const roleInput = document.querySelector('input[name="role"]:checked').value;
            
            const payload = {
                email,
                username,
                password,
                phone,
                role: roleInput
            };

            if (roleInput === 'owner') {
                payload.cafeName = document.getElementById('cafeName').value;
                payload.cafeAddress = document.getElementById('address').value;
                payload.openTime = document.getElementById('startTime').value;
                payload.closeTime = document.getElementById('endTime').value;
            }

            // Call API via apiClient
            const response = await apiClient.post('/auth/register', payload);

            if (response.success) {
                await openAlertModal('Thành công', 'Đăng ký thành công!');
                window.location.href = 'signin.html';
            } else {
                await openAlertModal('Lỗi đăng ký', response.error || 'Không thể đăng ký.');
            }
        });
    }

    // Signin Form Logic
    const signinForm = document.getElementById('signinForm');
    if (signinForm) {
        signinForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const identifier = document.getElementById('emailOrUsername').value;
            const password = document.getElementById('password').value;

            const response = await apiClient.post('/auth/login', {
                identifier: identifier,
                password: password
            });

            if (response.success) {
                await openAlertModal('Thành công', 'Đăng nhập thành công!');
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('userRole', response.data.user.role);
                localStorage.setItem('userId', response.data.user.id);
                localStorage.setItem('username', response.data.user.username);
                window.location.href = 'index.html';
            } else {
                await openAlertModal('Lỗi đăng nhập', response.error || 'Không thể đăng nhập.');
            }
        });
    }

    // Notification Dropdown Logic
    let notificationBtn = document.getElementById('notificationBtn');
    let notificationDropdown = document.getElementById('notificationDropdown');
    let profileBtn = document.getElementById('profileBtn');
    const token = localStorage.getItem('token');
    const headerIcons = document.querySelector('.header-icons');
    const dict = getLocaleText();

    if (!token && headerIcons) {
        headerIcons.innerHTML = `
            <button class="header-btn" id="settingsIcon" title="${dict.titleSettings}">
                <i class="fa-solid fa-gear"></i>
            </button>
        `;
        const settingsIcon = document.getElementById('settingsIcon');
        if (settingsIcon) {
            settingsIcon.addEventListener('click', () => {
                window.location.href = 'settings.html';
            });
        }
        applyLanguage();
        return;
    }

    if (token && headerIcons) {
        headerIcons.innerHTML = `
            <div class="notification-wrapper">
                <button class="header-btn" id="notificationBtn" title="${dict.notificationTitle}">
                    <i class="fa-regular fa-bell"></i>
                    <span class="notification-badge hidden" id="notificationBadge">0</span>
                </button>
                <div class="dropdown-menu hidden" id="notificationDropdown">
                    <p class="dropdown-empty">${dict.notificationEmpty}</p>
                </div>
            </div>
            <div class="profile-avatar" id="profileBtn" title="${dict.profileTitle}">
                <i class="fa-solid fa-user"></i>
            </div>
        `;
        notificationBtn = document.getElementById('notificationBtn');
        notificationDropdown = document.getElementById('notificationDropdown');
        profileBtn = document.getElementById('profileBtn');
        updateNotificationBadge();
    }

    if (notificationBtn && notificationDropdown) {
        notificationBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent click from bubbling to document
            notificationDropdown.classList.toggle('hidden');
            if (!notificationDropdown.classList.contains('hidden')) {
                loadNotifications(notificationDropdown);
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!notificationDropdown.classList.contains('hidden') && !notificationDropdown.contains(e.target) && e.target !== notificationBtn) {
                notificationDropdown.classList.add('hidden');
            }
        });
    }

    if (profileBtn) {
        profileBtn.addEventListener('click', () => {
            window.location.href = token ? 'settings.html' : 'signin.html';
        });
    }

    applyTheme();
    applyLanguage();
});

// Home Page specific logic
async function initHomePage() {
    const dict = getLocaleText();
    const headerAuthIcons = document.getElementById('headerAuthIcons');
    const cafeGrid = document.getElementById('cafeGrid');
    const myCafesSection = document.getElementById('myCafesSection');
    const myCafeGrid = document.getElementById('myCafeGrid');
    const searchInput = document.getElementById('searchInput');
    
    // 1. Auth State Logic
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    const userId = localStorage.getItem('userId');

    const renderCafeCards = (targetGrid, cafes) => {
        if (!targetGrid) return;
        targetGrid.innerHTML = '';
        cafes.forEach((cafe) => {
            const imageUrl = cafe.image_url || 'cafe.png';
            const cardHTML = `
                <article class="cafe-card">
                    <a href="cafe-detail.html?id=${cafe.id}" class="cafe-card-link">
                        <img src="${imageUrl}" alt="${cafe.name}" class="cafe-card-img" onerror="this.src='cafe.png'">
                        <div class="cafe-card-info">
                            <h3 class="cafe-card-title">${cafe.name}</h3>
                        </div>
                    </a>
                    <a href="cafe-map.html?cafe_id=${cafe.id}" class="cafe-card-map-btn" title="${dict.viewOnMap}" aria-label="${dict.viewOnMap}">
                        <i class="fa-solid fa-map-location-dot"></i>
                    </a>
                </article>
            `;
            targetGrid.innerHTML += cardHTML;
        });
    };
    
    if (token) {
        // Logged In State: Show Bell and User Profile
        headerAuthIcons.innerHTML = `
            <div class="notification-wrapper">
                <button class="header-btn" id="notificationBtn" title="Thông báo">
                    <i class="fa-regular fa-bell"></i>
                    <span class="notification-badge hidden" id="notificationBadge">0</span>
                </button>
                <div class="dropdown-menu hidden" id="notificationDropdown">
                    <p class="dropdown-empty">通知はありません</p>
                </div>
            </div>
            <div class="profile-avatar" id="profileIcon" title="Hồ sơ">
                <i class="fa-solid fa-user"></i>
            </div>
        `;
        const profileIcon = document.getElementById('profileIcon');
        if (profileIcon) {
            profileIcon.addEventListener('click', () => {
                window.location.href = 'settings.html';
            });
        }
        updateNotificationBadge();

        const notificationBtn = document.getElementById('notificationBtn');
        const notificationDropdown = document.getElementById('notificationDropdown');
        if (notificationBtn && notificationDropdown) {
            notificationBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                notificationDropdown.classList.toggle('hidden');
                if (!notificationDropdown.classList.contains('hidden')) {
                    loadNotifications(notificationDropdown);
                }
            });
            document.addEventListener('click', (event) => {
                if (!notificationDropdown.classList.contains('hidden')
                    && !notificationDropdown.contains(event.target)
                    && event.target !== notificationBtn) {
                    notificationDropdown.classList.add('hidden');
                }
            });
        }
    } else {
        // Logged Out State: Show Settings Gear (3)
        headerAuthIcons.innerHTML = `
            <button class="header-btn" id="settingsIcon" title="Cài đặt" onclick="window.location.href='settings.html'">
                <i class="fa-solid fa-gear"></i>
            </button>
        `;
    }

    injectHeaderMapLink(headerAuthIcons);

    if (searchInput) {
        searchInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                const keyword = searchInput.value.trim();
                const targetUrl = keyword ? `search.html?keyword=${encodeURIComponent(keyword)}` : 'search.html';
                window.location.href = targetUrl;
            }
        });
    }

    // 2. Fetch Recommended Cafes
    if (cafeGrid) {
        try {
            const response = await apiClient.get('/cafes');
            
            if (response.success && response.data && response.data.length > 0) {
                renderCafeCards(cafeGrid, response.data);
            } else {
                cafeGrid.innerHTML = `<div class="loading-text">${dict.homeEmpty}</div>`;
            }
        } catch (error) {
            console.error('Lỗi khi lấy danh sách quán:', error);
            cafeGrid.innerHTML = `<div class="loading-text" style="color: red;">${dict.homeError}</div>`;
        }
    }

    if (myCafesSection && myCafeGrid) {
        const isOwner = token && userRole === 'owner' && userId;
        myCafesSection.classList.toggle('hidden', !isOwner);
        if (isOwner) {
            try {
                const ownerResponse = await apiClient.get(`/cafes?owner_id=${userId}`);
                const ownerCafes = ownerResponse.success && Array.isArray(ownerResponse.data)
                    ? ownerResponse.data
                    : [];
                if (ownerCafes.length > 0) {
                    renderCafeCards(myCafeGrid, ownerCafes);
                } else {
                    myCafeGrid.innerHTML = `<div class="loading-text">${dict.homeEmpty}</div>`;
                }
            } catch (error) {
                console.error('Cannot load owner cafes:', error);
                myCafeGrid.innerHTML = `<div class="loading-text" style="color: red;">${dict.homeError}</div>`;
            }
        }
    }
}

const getQueryParam = (name) => {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
};

const DEFAULT_GEOCODE_CITY = 'Hanoi';
const DEFAULT_GEOCODE_COUNTRY = 'Vietnam';
const VIETNAM_MAP_CENTER = [16.047079, 108.20623];
const VIETNAM_MAP_ZOOM = 6;
const VIETNAM_CAFE_ZOOM = 15;
const getVietnamBounds = () => {
    if (typeof L === 'undefined') return null;
    return L.latLngBounds([8.18, 102.14], [23.39, 109.46]);
};

const nominatimHeaders = {
    'Accept-Language': 'vi,en',
    'User-Agent': 'WorkingCafe/1.0'
};

const searchLocationsInVietnam = async (query) => {
    const trimmed = String(query || '').trim();
    if (!trimmed) return [];
    const params = new URLSearchParams({
        format: 'json',
        q: trimmed,
        countrycodes: 'vn',
        limit: '6',
        addressdetails: '1'
    });
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?${params.toString()}`,
            { headers: nominatimHeaders }
        );
        if (!response.ok) return [];
        const data = await response.json();
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('Location search failed:', error);
        return [];
    }
};

const reverseGeocodeLocation = async (lat, lng) => {
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    const params = new URLSearchParams({
        format: 'json',
        lat: String(lat),
        lon: String(lng),
        addressdetails: '1'
    });
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?${params.toString()}`,
            { headers: nominatimHeaders }
        );
        if (!response.ok) return null;
        const data = await response.json();
        if (!data) return null;
        const addr = data.address || {};
        const city = addr.city || addr.town || addr.county || addr.state || null;
        return {
            display: data.display_name || '',
            city
        };
    } catch (error) {
        console.error('Reverse geocode failed:', error);
        return null;
    }
};

const formatCafeTime = (value) => {
    if (!value) return '--:--';
    const match = String(value).match(/(\d{1,2}):(\d{2})/);
    if (!match) return String(value);
    return `${match[1].padStart(2, '0')}:${match[2]}`;
};

const formatCafeHours = (openTime, closeTime) =>
    `${formatCafeTime(openTime)} - ${formatCafeTime(closeTime)}`;

const injectHeaderMapLink = (container) => {
    if (!container || container.querySelector('.header-map-link')) return;
    const dict = getLocaleText();
    const link = document.createElement('a');
    link.href = 'cafe-map.html';
    link.className = 'header-btn header-map-link';
    link.title = dict.viewAllOnMap;
    link.setAttribute('aria-label', dict.viewAllOnMap);
    link.innerHTML = '<i class="fa-solid fa-map-location-dot"></i>';
    container.insertBefore(link, container.firstChild);
};

const renderStars = (rating) => {
    const value = Number(rating) || 0;
    let html = '';
    for (let i = 1; i <= 5; i += 1) {
        const active = i <= Math.round(value);
        html += `<i class="fa-solid fa-star" style="color: ${active ? '#f1c40f' : '#ccc'};"></i>`;
    }
    return html;
};

const calculateAverageRating = (reviews) => {
    if (!Array.isArray(reviews) || reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0);
    return total / reviews.length;
};

const openModal = ({ title, fields = [], submitText = '保存', cancelText = 'キャンセル', message = '' }) => {
    return new Promise((resolve) => {
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop';

        const card = document.createElement('div');
        card.className = 'modal-card';

        const titleEl = document.createElement('div');
        titleEl.className = 'modal-title';
        titleEl.textContent = title;

        const fieldsWrap = document.createElement('div');
        fieldsWrap.className = 'modal-fields';

        if (message) {
            const messageEl = document.createElement('div');
            messageEl.textContent = message;
            fieldsWrap.appendChild(messageEl);
        }

        const inputs = {};
        fields.forEach((field) => {
            const fieldWrap = document.createElement('label');
            fieldWrap.className = 'modal-field';
            fieldWrap.textContent = field.label;

            let inputEl;
            if (field.type === 'textarea') {
                inputEl = document.createElement('textarea');
                inputEl.rows = 3;
            } else {
                inputEl = document.createElement('input');
                inputEl.type = field.type || 'text';
            }

            if (field.placeholder) inputEl.placeholder = field.placeholder;
            if (field.step !== undefined) inputEl.step = field.step;
            if (field.min !== undefined) inputEl.min = field.min;
            if (field.max !== undefined) inputEl.max = field.max;
            if (field.value !== undefined && field.value !== null && field.type !== 'file') {
                inputEl.value = field.value;
            }

            inputs[field.name] = inputEl;
            fieldWrap.appendChild(inputEl);
            fieldsWrap.appendChild(fieldWrap);
        });

        const actions = document.createElement('div');
        actions.className = 'modal-actions';

        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'modal-btn ghost';
        cancelBtn.textContent = cancelText;

        const submitBtn = document.createElement('button');
        submitBtn.className = 'modal-btn primary';
        submitBtn.textContent = submitText;

        actions.appendChild(cancelBtn);
        actions.appendChild(submitBtn);

        card.appendChild(titleEl);
        card.appendChild(fieldsWrap);
        card.appendChild(actions);
        backdrop.appendChild(card);
        document.body.appendChild(backdrop);

        const cleanup = () => {
            document.body.removeChild(backdrop);
        };

        cancelBtn.addEventListener('click', () => {
            cleanup();
            resolve(null);
        });

        backdrop.addEventListener('click', (event) => {
            if (event.target === backdrop) {
                cleanup();
                resolve(null);
            }
        });

        submitBtn.addEventListener('click', () => {
            const values = {};
            Object.entries(inputs).forEach(([key, input]) => {
                values[key] = input.type === 'file' ? input.files[0] || null : input.value;
            });
            cleanup();
            resolve(values);
        });
    });
};

const openConfirmModal = async (title, message) => {
    const result = await openModal({ title, message, submitText: 'OK', cancelText: 'Hủy' });
    return result !== null;
};

const openAlertModal = async (title, message) => {
    await openModal({ title, message, submitText: 'OK', cancelText: 'Đóng' });
};

const MAX_CAFE_IMAGES = 10;
const MAX_BESTSELLERS = 3;

const getCafeImages = async (cafeId, fallbackUrl) => {
    const response = await apiClient.get(`/cafes/${cafeId}/images`);
    const rows = response.success && Array.isArray(response.data) ? response.data : [];
    const cleaned = rows
        .map((item) => item.image_url || item.url || '')
        .filter((url) => !!url);

    if (cleaned.length === 0 && fallbackUrl) {
        cleaned.push(fallbackUrl);
    }

    return cleaned.slice(0, MAX_CAFE_IMAGES);
};

const saveCafeImages = async (cafeId, images) => {
    return await apiClient.put(`/cafes/${cafeId}/images`, { images });
};

const getCafeBestsellers = (cafeId) => {
    const key = `cafe_bestsellers_${cafeId}`;
    try {
        const raw = JSON.parse(localStorage.getItem(key) || '[]');
        return Array.isArray(raw) ? raw : [];
    } catch (error) {
        return [];
    }
};

const saveCafeBestsellers = (cafeId, ids) => {
    const key = `cafe_bestsellers_${cafeId}`;
    localStorage.setItem(key, JSON.stringify(ids));
};

const updateGalleryGrid = (images, fallbackUrl) => {
    const grid = document.querySelector('.gallery-grid');
    const slots = Array.from(document.querySelectorAll('.gallery-grid img'));
    const normalized = images.filter((url) => !!url);
    const fallback = fallbackUrl || 'cafe.png';

    slots.forEach((img, index) => {
        const src = normalized[index] || (index === 0 ? fallback : 'cafe.png');
        img.src = src;
        img.onerror = () => { img.src = 'cafe.png'; };
    });

    if (grid) {
        const count = Math.max(1, normalized.length);
        grid.setAttribute('data-count', count >= 4 ? 4 : count);
        
        const morePhotos = document.getElementById('detailMorePhotos');
        if (morePhotos) {
            morePhotos.style.display = normalized.length > 1 ? 'block' : 'none';
        }
    }
};

const openChecklistModal = ({ title, options, selectedIds = [], maxSelect = null, submitText = 'Lưu' }) => {
    return new Promise((resolve) => {
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop';

        const card = document.createElement('div');
        card.className = 'modal-card checklist-modal';

        const titleEl = document.createElement('div');
        titleEl.className = 'modal-title';
        titleEl.textContent = title;

        const messageEl = document.createElement('div');
        messageEl.className = 'checklist-message';

        const listEl = document.createElement('div');
        listEl.className = 'checklist-list';

        const state = new Set(selectedIds.map((id) => Number(id)));

        const updateMessage = (text) => {
            messageEl.textContent = text || '';
        };

        options.forEach((item) => {
            const row = document.createElement('label');
            row.className = 'checklist-row';

            const input = document.createElement('input');
            input.type = 'checkbox';
            input.checked = state.has(Number(item.id));
            input.addEventListener('change', () => {
                if (input.checked) {
                    if (maxSelect && state.size >= maxSelect) {
                        input.checked = false;
                        updateMessage(`Chỉ chọn tối đa ${maxSelect} mục.`);
                        return;
                    }
                    state.add(Number(item.id));
                } else {
                    state.delete(Number(item.id));
                }
                updateMessage('');
            });

            const text = document.createElement('span');
            text.textContent = item.label;

            row.appendChild(input);
            row.appendChild(text);
            listEl.appendChild(row);
        });

        const actions = document.createElement('div');
        actions.className = 'modal-actions';

        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'modal-btn ghost';
        cancelBtn.textContent = 'Hủy';

        const submitBtn = document.createElement('button');
        submitBtn.className = 'modal-btn primary';
        submitBtn.textContent = submitText;

        actions.appendChild(cancelBtn);
        actions.appendChild(submitBtn);

        card.appendChild(titleEl);
        card.appendChild(messageEl);
        card.appendChild(listEl);
        card.appendChild(actions);
        backdrop.appendChild(card);
        document.body.appendChild(backdrop);

        const cleanup = () => {
            document.body.removeChild(backdrop);
        };

        cancelBtn.addEventListener('click', () => {
            cleanup();
            resolve(null);
        });

        submitBtn.addEventListener('click', () => {
            cleanup();
            resolve(Array.from(state));
        });

        backdrop.addEventListener('click', (event) => {
            if (event.target === backdrop) {
                cleanup();
                resolve(null);
            }
        });
    });
};

const openGalleryManager = ({ cafeId, cafe, initialImages, onSave }) => {
    return new Promise((resolve) => {
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop';

        const card = document.createElement('div');
        card.className = 'modal-card gallery-manager';

        const titleEl = document.createElement('div');
        titleEl.className = 'modal-title';
        titleEl.textContent = 'Quản lý ảnh quán';

        const messageEl = document.createElement('div');
        messageEl.className = 'gallery-message';

        const avatarWrap = document.createElement('div');
        avatarWrap.className = 'gallery-section-block';
        const avatarLabel = document.createElement('div');
        avatarLabel.className = 'gallery-label';
        avatarLabel.textContent = 'Ảnh đại diện (URL)';
        const avatarInput = document.createElement('input');
        avatarInput.type = 'text';
        avatarInput.placeholder = 'https://...';
        avatarInput.value = initialImages[0] || cafe.image_url || '';
        const avatarBtn = document.createElement('button');
        avatarBtn.className = 'modal-btn primary';
        avatarBtn.textContent = 'Cập nhật avatar';
        avatarWrap.appendChild(avatarLabel);
        avatarWrap.appendChild(avatarInput);
        avatarWrap.appendChild(avatarBtn);

        const addWrap = document.createElement('div');
        addWrap.className = 'gallery-section-block';
        const addLabel = document.createElement('div');
        addLabel.className = 'gallery-label';
        addLabel.textContent = 'Thêm ảnh (URL)';
        const addInput = document.createElement('input');
        addInput.type = 'text';
        addInput.placeholder = 'https://...';
        const addBtn = document.createElement('button');
        addBtn.className = 'modal-btn primary';
        addBtn.textContent = 'Thêm ảnh';
        addWrap.appendChild(addLabel);
        addWrap.appendChild(addInput);
        addWrap.appendChild(addBtn);

        const listEl = document.createElement('div');
        listEl.className = 'gallery-list';

        const actions = document.createElement('div');
        actions.className = 'modal-actions';

        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'modal-btn ghost';
        cancelBtn.textContent = 'Đóng';

        const saveBtn = document.createElement('button');
        saveBtn.className = 'modal-btn primary';
        saveBtn.textContent = 'Lưu thay đổi';

        actions.appendChild(cancelBtn);
        actions.appendChild(saveBtn);

        card.appendChild(titleEl);
        card.appendChild(messageEl);
        card.appendChild(avatarWrap);
        card.appendChild(addWrap);
        card.appendChild(listEl);
        card.appendChild(actions);
        backdrop.appendChild(card);
        document.body.appendChild(backdrop);

        let workingImages = [...initialImages];

        const setMessage = (text) => {
            messageEl.textContent = text || '';
        };

        const renderList = () => {
            listEl.innerHTML = '';
            workingImages.forEach((url, index) => {
                const row = document.createElement('div');
                row.className = 'gallery-row';

                const thumb = document.createElement('img');
                thumb.className = 'gallery-thumb';
                thumb.src = url;
                thumb.alt = `Ảnh ${index + 1}`;
                thumb.onerror = () => { thumb.src = 'cafe.png'; };

                const urlText = document.createElement('div');
                urlText.className = 'gallery-url';
                urlText.textContent = url;

                row.appendChild(thumb);
                row.appendChild(urlText);

                if (index === 0) {
                    const badge = document.createElement('span');
                    badge.className = 'gallery-badge';
                    badge.textContent = 'Avatar';
                    row.appendChild(badge);
                } else {
                    const removeBtn = document.createElement('button');
                    removeBtn.className = 'gallery-remove-btn';
                    removeBtn.textContent = 'Xóa';
                    removeBtn.addEventListener('click', async () => {
                        const confirmed = await openConfirmModal('Xóa ảnh', 'Xóa ảnh này khỏi danh sách?');
                        if (!confirmed) return;
                        workingImages = workingImages.filter((_, idx) => idx !== index);
                        renderList();
                    });
                    row.appendChild(removeBtn);
                }

                listEl.appendChild(row);
            });
        };

        const updateAvatar = () => {
            const url = avatarInput.value.trim();
            if (!url) {
                setMessage('Vui lòng nhập URL ảnh đại diện.');
                return;
            }
            const existingIndex = workingImages.indexOf(url);
            if (existingIndex > -1) {
                workingImages.splice(existingIndex, 1);
            }
            workingImages.unshift(url);
            workingImages = workingImages.slice(0, MAX_CAFE_IMAGES);
            setMessage('');
            renderList();
        };

        const addImage = () => {
            const url = addInput.value.trim();
            if (!url) {
                setMessage('Vui lòng nhập URL ảnh.');
                return;
            }
            if (workingImages.length >= MAX_CAFE_IMAGES) {
                setMessage('Tối đa 10 ảnh cho quán.');
                return;
            }
            if (workingImages.includes(url)) {
                setMessage('Ảnh này đã có trong danh sách.');
                return;
            }
            workingImages.push(url);
            addInput.value = '';
            setMessage('');
            renderList();
        };

        avatarBtn.addEventListener('click', updateAvatar);
        addBtn.addEventListener('click', addImage);

        cancelBtn.addEventListener('click', () => {
            document.body.removeChild(backdrop);
            resolve(null);
        });

        saveBtn.addEventListener('click', async () => {
            if (workingImages.length === 0) {
                setMessage('Vui lòng đặt ảnh đại diện trước.');
                return;
            }
            await onSave(workingImages);
            document.body.removeChild(backdrop);
            resolve(workingImages);
        });

        backdrop.addEventListener('click', (event) => {
            if (event.target === backdrop) {
                document.body.removeChild(backdrop);
                resolve(null);
            }
        });

        renderList();
    });
};

const openGalleryViewer = (images) => {
    return new Promise((resolve) => {
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop';

        const card = document.createElement('div');
        card.className = 'modal-card gallery-viewer';

        const titleEl = document.createElement('div');
        titleEl.className = 'modal-title';
        titleEl.textContent = 'Tất cả ảnh';

        const grid = document.createElement('div');
        grid.className = 'gallery-view-grid';

        images.forEach((url, index) => {
            const img = document.createElement('img');
            img.src = url;
            img.alt = `Ảnh ${index + 1}`;
            img.className = 'gallery-view-image';
            img.onerror = () => { img.src = 'cafe.png'; };
            grid.appendChild(img);
        });

        const actions = document.createElement('div');
        actions.className = 'modal-actions';

        const closeBtn = document.createElement('button');
        closeBtn.className = 'modal-btn primary';
        closeBtn.textContent = 'Đóng';

        actions.appendChild(closeBtn);

        card.appendChild(titleEl);
        card.appendChild(grid);
        card.appendChild(actions);
        backdrop.appendChild(card);
        document.body.appendChild(backdrop);

        const cleanup = () => {
            document.body.removeChild(backdrop);
        };

        closeBtn.addEventListener('click', () => {
            cleanup();
            resolve();
        });

        backdrop.addEventListener('click', (event) => {
            if (event.target === backdrop) {
                cleanup();
                resolve();
            }
        });
    });
};

const getLocaleText = () => {
    const language = localStorage.getItem('language') || 'vi';
    const text = {
        vi: {
            titleHome: 'Trang chủ',
            titleSearch: 'Tìm kiếm',
            titleMenu: 'Menu',
            titleReviews: 'Đánh giá',
            reviewsSummaryTitle: 'Đánh giá khách hàng',
            reviewsVoiceTitle: 'Ý kiến khách hàng',
            titleBooking: 'Đặt chỗ',
            titleSettings: 'Cài đặt',
            titleDetail: 'Thông tin quán',
            titleMap: 'Bản đồ',
            titleSignin: 'Đăng nhập',
            titleSignup: 'Đăng ký',
            searchPlaceholder: 'Tìm kiếm...',
            recommendedTitle: 'Gợi ý quán',
            myCafesTitle: 'Quán của tôi',
            searchSuggestLabel: 'Đề xuất:',
            searchSuggestUnit: 'quán',
            searchTitle: 'Gợi ý quán',
            location: 'Địa điểm',
            feature: 'Đặc điểm',
            time: 'Thời gian',
            prev: 'Trở lại',
            next: 'Tiếp',
            menuDetail: 'Chi tiết',
            menuReview: 'Gửi đánh giá',
            menuReviewTitle: 'Đánh giá',
            menuAdd: 'Thêm mới',
            reviewPlaceholder: 'Nhập đánh giá...',
            reviewSubmit: 'Gửi đánh giá',
            bookingTitle: 'Đặt chỗ online',
            bookingDate: 'Ngày đặt chỗ',
            bookingTime: 'Giờ đến',
            bookingPeople: 'Số người',
            bookingNote: 'Yêu cầu khác',
            bookingSubmit: 'Gửi',
            bookingFeatures: 'Tiện ích',
            featureSmoking: 'Khu vực hút thuốc',
            featureOutlet: 'Ổ cắm',
            featureAir: 'Điều hòa',
            featureWifi: 'Wi-Fi',
            addressLabel: 'Địa chỉ:',
            notificationEmpty: 'Không có thông báo',
            notificationTitle: 'Thông báo',
            notificationApprove: 'Chấp nhận',
            notificationReject: 'Từ chối',
            notificationBack: 'Quay lại',
            profileTitle: 'Hồ sơ',
            homeLoading: 'Đang tải quán...',
            homeEmpty: 'Không có quán nào để hiển thị.',
            homeError: 'Lỗi tải dữ liệu.',
            viewOnMap: 'Xem trên bản đồ',
            viewAllOnMap: 'Bản đồ quán',
            mapLoadError: 'Không thể tải dữ liệu quán. Vui lòng thử lại.',
            mapEmpty: 'Không tìm thấy quán.',
            mapSetLocation: 'Đặt vị trí trên bản đồ',
            mapSetLocationHint: 'Bấm nút "Đặt vị trí" rồi chọn điểm trên bản đồ.',
            mapSetLocationActive: 'Chọn vị trí trên bản đồ...',
            mapViewDetail: 'Xem chi tiết quán',
            mapGeocodeFailed: 'Không xác định được vị trí từ địa chỉ. Chủ quán có thể đặt thủ công.',
            mapSearchPlaceholder: 'Tìm địa chỉ tại Việt Nam...',
            mapSearchBtn: 'Tìm',
            mapSearchNoResults: 'Không tìm thấy địa điểm.',
            mapLocationSaved: 'Đã lưu vị trí và địa chỉ.',
            mapSearchSelectHint: 'Chọn một kết quả hoặc bấm trên bản đồ để đặt vị trí.',
            detailMorePhotos: 'Xem thêm ảnh',
            detailBestseller: 'Bán chạy',
            detailCriteria: 'Tiêu chí',
            detailMenuLink: 'Xem toàn bộ menu',
            detailReviewTitle: 'Đánh giá',
            detailMoreReviews: 'Xem thêm đánh giá',
            emptyCriteria: 'Chưa có tiện ích.',
            emptyBestsellers: 'Chưa có đồ uống bán chạy.',
            emptyReviews: 'Chưa có đánh giá.',
            menuEmptyReviews: 'Chưa có đánh giá.',
            deleteLabel: 'Xóa',
            editLabel: 'Sửa',
            updateLabel: 'Cập nhật',
            signinPlaceholder: 'Email/Tên đăng nhập',
            passwordPlaceholder: 'Mật khẩu',
            phonePlaceholder: 'Số điện thoại',
            signupRoleUser: 'Đăng ký người dùng',
            signupRoleOwner: 'Đăng ký chủ quán',
            signupTimeLabel: 'Giờ mở cửa',
            signupCafeNamePlaceholder: 'Tên quán',
            signupCafeAddressPlaceholder: 'Địa chỉ',
            signupSubmit: 'Đăng ký',
            signupHint: 'Đã có tài khoản?',
            signupLink: 'Đăng nhập',
            signinSubmit: 'Đăng nhập',
            signinHint: 'Chưa có tài khoản?',
            signinLink: 'Đăng ký',
            login: 'Đăng nhập'
        },
        jp: {
            titleHome: 'ホーム',
            titleSearch: '検索',
            titleMenu: 'メニュー',
            titleReviews: 'レビュー',
            reviewsSummaryTitle: 'カスタマー評価',
            reviewsVoiceTitle: 'お客様の声',
            titleBooking: '予約',
            titleSettings: '設定',
            titleDetail: '詳細',
            titleMap: 'マップ',
            titleSignin: 'ログイン',
            titleSignup: '登録',
            searchPlaceholder: '検索...',
            recommendedTitle: 'おすすめ店舗',
            myCafesTitle: '私のカフェ',
            searchSuggestLabel: '提案:',
            searchSuggestUnit: '店',
            searchTitle: 'おすすめ店舗',
            location: '地点',
            feature: '特徴',
            time: '時間',
            prev: '戻る',
            next: '次へ',
            menuDetail: '詳細',
            menuReview: 'レビュー送信',
            menuReviewTitle: 'レビュー',
            menuAdd: '追加',
            reviewPlaceholder: 'レビューを入力...',
            reviewSubmit: 'レビューを投稿する',
            bookingTitle: 'オンライン予約',
            bookingDate: '予約希望日',
            bookingTime: '来店時間',
            bookingPeople: '人数',
            bookingNote: 'その他ご要望',
            bookingSubmit: '送信',
            bookingFeatures: '設備・サービス',
            featureSmoking: '喫煙席',
            featureOutlet: 'コンセント',
            featureAir: '空調',
            featureWifi: 'Wi-Fi',
            addressLabel: 'アドレス:',
            notificationEmpty: '通知はありません',
            notificationTitle: '通知',
            notificationApprove: '承認',
            notificationReject: '拒否',
            notificationBack: '戻る',
            profileTitle: 'プロフィール',
            homeLoading: '読み込み中...',
            homeEmpty: '表示できる店舗がありません。',
            homeError: '読み込みエラー。',
            viewOnMap: '地図で見る',
            viewAllOnMap: 'カフェ地図',
            mapLoadError: '店舗データを読み込めませんでした。',
            mapEmpty: '店舗が見つかりません。',
            mapSetLocation: '地図で位置を設定',
            mapSetLocationHint: '「地図で位置を設定」を押してから地図上の地点を選んでください。',
            mapSetLocationActive: '地図上の地点を選択...',
            mapViewDetail: '店舗詳細を見る',
            mapGeocodeFailed: '住所から位置を特定できませんでした。',
            mapSearchPlaceholder: 'ベトナムの住所を検索...',
            mapSearchBtn: '検索',
            mapSearchNoResults: '場所が見つかりません。',
            mapLocationSaved: '位置と住所を保存しました。',
            mapSearchSelectHint: '結果を選ぶか、地図をクリックして位置を設定してください。',
            detailMorePhotos: 'その他の写真を見る',
            detailBestseller: 'ベストセラー',
            detailCriteria: 'クライテリア',
            detailMenuLink: 'メニュー全体を見る',
            detailReviewTitle: '評価',
            detailMoreReviews: 'その他の評価を見る',
            emptyCriteria: '設備情報はまだありません。',
            emptyBestsellers: 'ベストセラーはまだありません。',
            emptyReviews: 'まだ評価がありません。',
            menuEmptyReviews: 'まだ評価がありません。',
            deleteLabel: '削除',
            editLabel: '編集',
            updateLabel: '更新',
            signinPlaceholder: 'メール/ユーザー名',
            passwordPlaceholder: 'パスワード',
            phonePlaceholder: '電話番号',
            signupRoleUser: 'ユーザーとして登録',
            signupRoleOwner: 'カフェオーナーとして登録',
            signupTimeLabel: '営業時間',
            signupCafeNamePlaceholder: 'カフェ名',
            signupCafeAddressPlaceholder: '住所',
            signupSubmit: '登録する',
            signupHint: '既にアカウントをお持ちですか？',
            signupLink: 'ログイン',
            signinSubmit: 'ログイン',
            signinHint: 'アカウントをお持ちでない方？',
            signinLink: '登録',
            login: 'ログイン'
        }
    };

    return text[language] || text.vi;
};

const applyTheme = () => {
    const theme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', theme);
};

const applyLanguage = () => {
    const dict = getLocaleText();

    if (document.body.classList.contains('home-page')) {
        document.title = `Working Cafe - ${dict.titleHome}`;
        const searchInput = document.getElementById('searchInput');
        if (searchInput) searchInput.placeholder = dict.searchPlaceholder;
        const title = document.getElementById('homeRecommendedTitle');
        if (title) title.textContent = dict.recommendedTitle;
        const myCafesTitle = document.getElementById('homeMyCafesTitle');
        if (myCafesTitle) myCafesTitle.textContent = dict.myCafesTitle || 'Quán của tôi';
        const loadingText = document.querySelector('.loading-text');
        if (loadingText) loadingText.textContent = dict.homeLoading;
    }

    if (document.body.classList.contains('search-body')) {
        document.title = `Working Cafe - ${dict.titleSearch}`;
        const keywordInput = document.getElementById('searchKeyword');
        if (keywordInput) keywordInput.placeholder = dict.searchPlaceholder;
        const suggestLabel = document.getElementById('suggestLabel');
        const suggestUnit = document.getElementById('suggestUnit');
        if (suggestLabel) suggestLabel.textContent = dict.searchSuggestLabel;
        if (suggestUnit) suggestUnit.textContent = dict.searchSuggestUnit;
        const locationBtn = document.getElementById('filterLocationBtn');
        const featureBtn = document.getElementById('filterFeatureBtn');
        const timeBtn = document.getElementById('filterTimeBtn');
        const locationBtnText = locationBtn?.querySelector('.filter-btn-text');
        const featureBtnText = featureBtn?.querySelector('.filter-btn-text');
        const timeBtnText = timeBtn?.querySelector('.filter-btn-text');
        if (locationBtnText) locationBtnText.textContent = dict.location;
        if (featureBtnText) featureBtnText.textContent = dict.feature;
        if (timeBtnText) timeBtnText.textContent = dict.time;
        const locationLabel = document.querySelector('#filterLocationGroup .filter-label');
        const featureLabel = document.querySelector('#filterFeatureGroup .filter-label');
        const timeLabel = document.querySelector('#filterTimeGroup .filter-label');
        if (locationLabel) locationLabel.textContent = dict.location;
        if (featureLabel) featureLabel.textContent = dict.feature;
        if (timeLabel) timeLabel.textContent = dict.time;
        const prevBtn = document.getElementById('prevPage');
        const nextBtn = document.getElementById('nextPage');
        if (prevBtn) prevBtn.setAttribute('aria-label', dict.prev);
        if (nextBtn) nextBtn.setAttribute('aria-label', dict.next);
    }

    if (document.body.classList.contains('menu-body')) {
        document.title = `Working Cafe - ${dict.titleMenu}`;
        const detailTitle = document.querySelector('.menu-detail-title');
        const reviewBtn = document.getElementById('submitMenuReview');
        const addBtn = document.getElementById('menuAddBtn');
        const reviewTitle = document.getElementById('menuReviewTitle');
        if (detailTitle) detailTitle.textContent = dict.menuDetail;
        if (reviewBtn) reviewBtn.textContent = dict.menuReview;
        if (addBtn) addBtn.textContent = dict.menuAdd || addBtn.textContent;
        if (reviewTitle) reviewTitle.textContent = dict.menuReviewTitle;
    }

    if (document.body.classList.contains('reviews-body')) {
        document.title = `Working Cafe - ${dict.titleReviews}`;
        const reviewInput = document.getElementById('reviewContent');
        const submitBtn = document.getElementById('submitReview');
        const summaryTitle = document.getElementById('reviewsSummaryTitle');
        const voiceTitle = document.getElementById('reviewsVoiceTitle');
        if (reviewInput) reviewInput.placeholder = dict.reviewPlaceholder;
        if (submitBtn) submitBtn.textContent = dict.reviewSubmit;
        if (summaryTitle) summaryTitle.textContent = dict.reviewsSummaryTitle;
        if (voiceTitle) voiceTitle.textContent = dict.reviewsVoiceTitle;
    }

    if (document.body.classList.contains('booking-body')) {
        document.title = `Working Cafe - ${dict.titleBooking}`;
        const title = document.querySelector('.booking-main .section-title');
        if (title) title.textContent = dict.bookingTitle;
        const dateLabel = document.getElementById('bookingDateLabel');
        const timeLabel = document.getElementById('bookingTimeLabel');
        const peopleLabel = document.getElementById('bookingPeopleLabel');
        const noteLabel = document.getElementById('bookingNoteLabel');
        const featuresTitle = document.getElementById('bookingFeaturesTitle');
        const smokingLabel = document.getElementById('featureSmokingLabel');
        const outletLabel = document.getElementById('featureOutletLabel');
        const airLabel = document.getElementById('featureAirLabel');
        const wifiLabel = document.getElementById('featureWifiLabel');
        const submitBtn = document.getElementById('bookingSubmitBtn');
        if (dateLabel) dateLabel.textContent = dict.bookingDate;
        if (timeLabel) timeLabel.textContent = dict.bookingTime;
        if (peopleLabel) peopleLabel.textContent = dict.bookingPeople;
        if (noteLabel) noteLabel.textContent = dict.bookingNote;
        if (featuresTitle) featuresTitle.textContent = dict.bookingFeatures;
        if (smokingLabel) smokingLabel.textContent = dict.featureSmoking;
        if (outletLabel) outletLabel.textContent = dict.featureOutlet;
        if (airLabel) airLabel.textContent = dict.featureAir;
        if (wifiLabel) wifiLabel.textContent = dict.featureWifi;
        if (submitBtn) submitBtn.textContent = dict.bookingSubmit;
    }

    if (document.body.classList.contains('detail-body')) {
        document.title = `Working Cafe - ${dict.titleDetail}`;
        const morePhotos = document.getElementById('detailMorePhotos');
        const bestsellerTitle = document.getElementById('detailBestsellerTitle');
        const criteriaTitle = document.getElementById('detailCriteriaTitle');
        const reviewTitle = document.getElementById('detailReviewTitle');
        const menuLink = document.getElementById('detailMenuLink');
        const moreReviews = document.getElementById('detailMoreReviews');
        if (morePhotos) morePhotos.textContent = dict.detailMorePhotos;
        if (bestsellerTitle) bestsellerTitle.textContent = dict.detailBestseller;
        if (criteriaTitle) criteriaTitle.textContent = dict.detailCriteria;
        if (reviewTitle) reviewTitle.textContent = dict.detailReviewTitle;
        if (menuLink) menuLink.textContent = dict.detailMenuLink;
        if (moreReviews) moreReviews.textContent = dict.detailMoreReviews;
        const addressEl = document.getElementById('detailCafeAddress');
        if (addressEl) {
            const value = addressEl.textContent.split(':').slice(1).join(':').trim();
            addressEl.innerHTML = `<strong>${dict.addressLabel}</strong> ${value}`;
        }
    }

    if (document.body.classList.contains('map-body')) {
        document.title = `Working Cafe - ${dict.titleMap}`;
    }

    const dropdownEmpty = document.querySelectorAll('.dropdown-empty');
    if (dropdownEmpty.length > 0) {
        dropdownEmpty.forEach((item) => {
            item.textContent = dict.notificationEmpty;
        });
    }

    if (document.body.classList.contains('settings-body')) {
        document.title = `Working Cafe - ${dict.titleSettings}`;
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) loginBtn.textContent = dict.login;
        const notificationBtn = document.getElementById('notificationBtn');
        if (notificationBtn) notificationBtn.title = dict.notificationTitle;
        const profileBtn = document.getElementById('profileBtn');
        if (profileBtn) profileBtn.title = dict.profileTitle;
    }

    const signinForm = document.getElementById('signinForm');
    if (signinForm) {
        document.title = `Working Cafe - ${dict.titleSignin}`;
        const emailInput = document.getElementById('emailOrUsername');
        const passwordInput = document.getElementById('password');
        const submitBtn = document.getElementById('signinSubmitBtn');
        const hint = document.getElementById('signinHint');
        const link = document.getElementById('signinLink');
        if (emailInput) emailInput.placeholder = dict.signinPlaceholder;
        if (passwordInput) passwordInput.placeholder = dict.passwordPlaceholder;
        if (submitBtn) submitBtn.textContent = dict.signinSubmit;
        if (hint) hint.textContent = dict.signinHint;
        if (link) link.textContent = dict.signinLink;
    }

    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        document.title = `Working Cafe - ${dict.titleSignup}`;
        const emailInput = document.getElementById('emailOrUsername');
        const passwordInput = document.getElementById('password');
        const phoneInput = document.getElementById('phoneNumber');
        const cafeNameInput = document.getElementById('cafeName');
        const cafeAddressInput = document.getElementById('address');
        const roleUser = document.getElementById('signupRoleUser');
        const roleOwner = document.getElementById('signupRoleOwner');
        const timeLabel = document.getElementById('signupTimeLabel');
        const submitBtn = document.getElementById('signupSubmitBtn');
        const hint = document.getElementById('signupHint');
        const link = document.getElementById('signupLink');
        if (emailInput) emailInput.placeholder = dict.signinPlaceholder;
        if (passwordInput) passwordInput.placeholder = dict.passwordPlaceholder;
        if (phoneInput) phoneInput.placeholder = dict.phonePlaceholder;
        if (cafeNameInput) cafeNameInput.placeholder = dict.signupCafeNamePlaceholder;
        if (cafeAddressInput) cafeAddressInput.placeholder = dict.signupCafeAddressPlaceholder;
        if (roleUser) roleUser.textContent = dict.signupRoleUser;
        if (roleOwner) roleOwner.textContent = dict.signupRoleOwner;
        if (timeLabel) timeLabel.textContent = dict.signupTimeLabel;
        if (submitBtn) submitBtn.textContent = dict.signupSubmit;
        if (hint) hint.textContent = dict.signupHint;
        if (link) link.textContent = dict.signupLink;
    }
};

const updateNotificationBadge = async (count = null) => {
    const badge = document.getElementById('notificationBadge');
    if (!badge) return;

    let pendingCount = count;
    if (pendingCount === null) {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            badge.classList.add('hidden');
            return;
        }
        const response = await apiClient.get(`/notifications?user_id=${userId}`);
        const notifications = response.success && Array.isArray(response.data) ? response.data : [];
        const parseBookingId = (content) => {
            if (typeof content !== 'string') return null;
            const match = content.match(/Booking\s*#(\d+)/i);
            return match ? Number(match[1]) : null;
        };
        const statuses = await Promise.all(notifications.map(async (item) => {
            const bookingId = parseBookingId(item.content);
            if (!bookingId) return null;
            const bookingResponse = await apiClient.get(`/bookings/${bookingId}`);
            const booking = bookingResponse.success ? bookingResponse.data : null;
            return booking?.status || null;
        }));
        pendingCount = statuses.filter((status) => status && status !== 'approved' && status !== 'cancelled').length;
    }

    badge.textContent = pendingCount > 99 ? '99+' : String(pendingCount);
    badge.classList.toggle('hidden', pendingCount <= 0);
};

const loadNotifications = async (container) => {
    const dict = getLocaleText();
    const userId = localStorage.getItem('userId');
    if (!userId || !container) return;
    const response = await apiClient.get(`/notifications?user_id=${userId}`);
    const notifications = response.success ? response.data : [];
    await updateNotificationBadge();
    if (notifications.length === 0) {
        container.innerHTML = `<p class="dropdown-empty">${dict.notificationEmpty}</p>`;
        return;
    }
    const role = localStorage.getItem('userRole') || 'user';
    const parseBookingId = (content) => {
        if (typeof content !== 'string') return null;
        const match = content.match(/Booking\s*#(\d+)/i);
        return match ? Number(match[1]) : null;
    };
    const bookingById = new Map();
    await Promise.all(notifications.map(async (item) => {
        const bookingId = parseBookingId(item.content);
        if (!bookingId || bookingById.has(Number(bookingId))) return;
        const bookingResponse = await apiClient.get(`/bookings/${bookingId}`);
        if (bookingResponse.success && bookingResponse.data) {
            bookingById.set(Number(bookingId), bookingResponse.data);
        }
    }));

    const isProcessedStatus = (status) => status === 'approved' || status === 'cancelled';
    const getPendingCount = () => notifications.filter((item) => {
        const bookingId = parseBookingId(item.content);
        const booking = bookingById.get(Number(bookingId));
        return booking?.status && !isProcessedStatus(booking.status);
    }).length;
    const getStatusText = (status) => {
        if (status === 'approved') return 'Đã chấp nhận';
        if (status === 'cancelled') return 'Đã từ chối';
        return '';
    };
    await updateNotificationBadge(getPendingCount());

    const renderList = () => {
        container.innerHTML = notifications
            .map((item) => {
                const bookingId = parseBookingId(item.content);
                const booking = bookingById.get(Number(bookingId));
                const statusText = getStatusText(booking?.status);
                const processedClass = isProcessedStatus(booking?.status) ? ' is-processed' : '';
                const showActions = role === 'owner' && bookingId && booking?.status && !isProcessedStatus(booking.status);
                const bookingText = booking
                    ? `Booking #${booking.id} - ${booking.booking_date} ${booking.booking_time}<br>- ${booking.number_of_people || 1} người`
                    : item.content;
                return `
                    <div class="notification-item${processedClass}" data-id="${item.id}" data-booking-id="${bookingId || ''}">
                        <span class="notification-item-content">${bookingText}</span>
                        ${statusText ? `<span class="notification-status">${statusText}</span>` : ''}
                        ${showActions ? `
                            <div class="notification-actions inline-actions">
                                <button class="notification-btn approve" data-action="approved" data-booking-id="${bookingId}" data-notification-id="${item.id}">${dict.notificationApprove}</button>
                                <button class="notification-btn reject" data-action="cancelled" data-booking-id="${bookingId}" data-notification-id="${item.id}">${dict.notificationReject}</button>
                            </div>
                        ` : ''}
                    </div>
                `;
            })
            .join('');

        container.querySelectorAll('.notification-btn').forEach((btn) => {
            btn.addEventListener('click', async (event) => {
                event.stopPropagation();
                const action = btn.dataset.action;
                const bookingTarget = btn.dataset.bookingId;
                const notificationId = btn.dataset.notificationId;
                const responseUpdate = await apiClient.put(`/bookings/${bookingTarget}`, { status: action });
                if (responseUpdate.success) {
                    const updatedBooking = Array.isArray(responseUpdate.data) ? responseUpdate.data[0] : responseUpdate.data;
                    const previousBooking = bookingById.get(Number(bookingTarget));
                    bookingById.set(Number(bookingTarget), updatedBooking || { ...previousBooking, status: action });
                    await apiClient.put(`/notifications/${notificationId}`, { is_read: true });
                    await updateNotificationBadge(getPendingCount());
                    renderList();
                }
            });
        });
    };

    const renderDetail = async (notificationId, bookingId) => {
        let booking = bookingById.get(Number(bookingId)) || null;
        if (bookingId && !booking) {
            const bookingResponse = await apiClient.get(`/bookings/${bookingId}`);
            booking = bookingResponse.success ? bookingResponse.data : null;
            if (booking) bookingById.set(Number(bookingId), booking);
        }
        const statusText = getStatusText(booking?.status);
        const isProcessed = isProcessedStatus(booking?.status);

        container.innerHTML = `
            <div class="notification-detail${isProcessed ? ' is-processed' : ''}">
                <button class="notification-back" type="button">${dict.notificationBack}</button>
                <div class="notification-detail-body">
                    <div class="notification-detail-text">
                        ${booking ? `#${booking.id} ${booking.booking_date} ${booking.booking_time} (${booking.number_of_people || 1})` : ''}
                    </div>
                    <div class="notification-detail-content"></div>
                    ${statusText ? `<div class="notification-status detail-status">${statusText}</div>` : ''}
                </div>
                ${role === 'owner' && bookingId && !isProcessed ? `
                    <div class="notification-actions">
                        <button class="notification-btn approve" data-action="approved" data-booking-id="${bookingId}" data-notification-id="${notificationId}">${dict.notificationApprove}</button>
                        <button class="notification-btn reject" data-action="cancelled" data-booking-id="${bookingId}" data-notification-id="${notificationId}">${dict.notificationReject}</button>
                    </div>
                ` : ''}
            </div>
        `;

        const backBtn = container.querySelector('.notification-back');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                renderList();
            });
        }

        const detailContent = container.querySelector('.notification-detail-content');
        if (detailContent) {
            const selected = notifications.find((item) => Number(item.id) === Number(notificationId));
            detailContent.textContent = selected?.content || '';
        }

        await apiClient.put(`/notifications/${notificationId}`, { is_read: true });
        await updateNotificationBadge();

        const actionButtons = container.querySelectorAll('.notification-btn');
        actionButtons.forEach((btn) => {
            btn.addEventListener('click', async () => {
                const action = btn.dataset.action;
                const bookingTarget = btn.dataset.bookingId;
                const responseUpdate = await apiClient.put(`/bookings/${bookingTarget}`, { status: action });
                if (responseUpdate.success) {
                    const updatedBooking = Array.isArray(responseUpdate.data) ? responseUpdate.data[0] : responseUpdate.data;
                    bookingById.set(Number(bookingTarget), updatedBooking || { ...booking, status: action });
                    await apiClient.put(`/notifications/${notificationId}`, { is_read: true });
                    await updateNotificationBadge(getPendingCount());
                    await renderDetail(notificationId, bookingTarget);
                }
            });
        });
    };

    renderList();

};

const buildTimeOptions = (selectEl, start = '08:00', end = '21:00') => {
    if (!selectEl) return;
    const parse = (value) => {
        const [h, m] = value.split(':').map(Number);
        return h * 60 + m;
    };
    const startMin = parse(start);
    const endMin = parse(end);
    selectEl.innerHTML = '<option value="">--</option>';
    for (let minutes = startMin; minutes <= endMin; minutes += 30) {
        const h = String(Math.floor(minutes / 60)).padStart(2, '0');
        const m = String(minutes % 60).padStart(2, '0');
        const value = `${h}:${m}`;
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        selectEl.appendChild(option);
    }
};

async function initSearchPage() {
    const dict = getLocaleText();
    injectHeaderMapLink(document.querySelector('.search-header .header-icons'));

    const keywordInput = document.getElementById('searchKeyword');
    const locationSelect = document.getElementById('filterLocation');
    const featureList = document.getElementById('featureList');
    const timeSelect = document.getElementById('filterTime');
    const resultsEl = document.getElementById('searchResults');
    const resultCount = document.getElementById('resultCount');
    const activeTags = document.getElementById('activeTags');
    const locationGroup = document.getElementById('filterLocationGroup');
    const featureGroup = document.getElementById('filterFeatureGroup');
    const timeGroup = document.getElementById('filterTimeGroup');

    const keywordParam = getQueryParam('keyword') || '';
    if (keywordInput) keywordInput.value = keywordParam;
    buildTimeOptions(timeSelect);

    const featureResponse = await apiClient.get('/features');
    const features = featureResponse.success ? featureResponse.data : [];

    if (featureList) {
        featureList.innerHTML = '';
        features.forEach((feature) => {
            const tag = document.createElement('button');
            tag.type = 'button';
            tag.className = 'filter-tag';
            tag.dataset.id = feature.id;
            tag.textContent = feature.name;
            tag.addEventListener('click', () => {
                tag.classList.toggle('active');
                loadResults();
            });
            featureList.appendChild(tag);
        });
    }

    const loadLocations = async () => {
        const cafeResponse = await apiClient.get('/cafes');
        const cafes = cafeResponse.success ? cafeResponse.data : [];
        const cities = [...new Set(cafes.map((cafe) => cafe.city).filter(Boolean))];
        if (locationSelect) {
            locationSelect.innerHTML = '';
            cities.forEach((city) => {
                const option = document.createElement('option');
                option.value = city;
                option.textContent = city;
                locationSelect.appendChild(option);
            });
        }
    };

    const pageSize = 3;
    let currentPage = 0;
    let allResults = [];

    const renderResults = () => {
        if (!resultsEl || !resultCount) return;
        resultsEl.innerHTML = '';
        const start = currentPage * pageSize;
        const end = start + pageSize;
        const pageItems = allResults.slice(start, end);

        pageItems.forEach((cafe) => {
            const imageUrl = cafe.image_url || 'cafe.png';
            const timeText = cafe.open_time && cafe.close_time
                ? formatCafeHours(cafe.open_time, cafe.close_time).replace(' - ', '-')
                : '';
            const card = document.createElement('article');
            card.className = 'cafe-card';
            card.innerHTML = `
                <a href="cafe-detail.html?id=${cafe.id}" class="cafe-card-link">
                    <img src="${imageUrl}" alt="${cafe.name}" class="cafe-card-img" onerror="this.src='cafe.png'">
                    <div class="cafe-card-info">
                        <h3 class="cafe-card-title">${cafe.name}</h3>
                    </div>
                    ${timeText ? `<div class="cafe-card-time">${timeText}</div>` : ''}
                </a>
                <a href="cafe-map.html?cafe_id=${cafe.id}" class="cafe-card-map-btn" title="${dict.viewOnMap}" aria-label="${dict.viewOnMap}">
                    <i class="fa-solid fa-map-location-dot"></i>
                </a>
            `;
            resultsEl.appendChild(card);
        });

        resultCount.textContent = String(allResults.length);

        const maxPage = Math.max(0, Math.floor((allResults.length - 1) / pageSize));
        const prevBtn = document.getElementById('prevPage');
        const nextBtn = document.getElementById('nextPage');
        if (prevBtn) prevBtn.disabled = currentPage <= 0;
        if (nextBtn) nextBtn.disabled = currentPage >= maxPage;
    };

    const renderTags = (keyword, selectedCity, selectedTime, selectedFeatures) => {
        if (!activeTags) return;
        activeTags.innerHTML = '';
        const addTag = (label, type, value) => {
            const tag = document.createElement('span');
            tag.className = 'search-tag-chip';
            tag.innerHTML = `${label}<i class="fa-solid fa-xmark" aria-hidden="true"></i>`;
            tag.dataset.type = type;
            tag.dataset.value = value;
            tag.addEventListener('click', () => {
                if (type === 'keyword' && keywordInput) keywordInput.value = '';
                if (type === 'city' && locationSelect) locationSelect.value = '';
                if (type === 'time' && timeSelect) timeSelect.value = '';
                if (type === 'feature') {
                    const btn = featureList?.querySelector(`[data-id="${value}"]`);
                    if (btn) btn.classList.remove('active');
                }
                loadResults();
            });
            activeTags.appendChild(tag);
        };

        if (keyword) addTag(keyword, 'keyword', keyword);
        if (selectedCity) addTag(selectedCity, 'city', selectedCity);
        if (selectedTime) addTag(selectedTime, 'time', selectedTime);
        selectedFeatures.forEach((feature) => addTag(feature.label, 'feature', feature.id));
        activeTags.classList.toggle('has-tags', activeTags.children.length > 0);
    };

    const loadResults = async () => {
        if (!resultsEl || !resultCount) return;
        const keyword = keywordInput?.value.trim() || '';
        const selectedCity = locationSelect?.value || '';
        const selectedTime = timeSelect?.value || '';
        const selectedFeatureButtons = Array.from(featureList?.querySelectorAll('.filter-tag.active') || []);
        const selectedFeatures = selectedFeatureButtons
            .map((tag) => tag.dataset.id)
            .filter(Boolean);

        const params = new URLSearchParams();
        if (keyword) params.set('keyword', keyword);
        if (selectedCity) params.set('city', selectedCity);
        if (selectedTime) params.set('time', selectedTime);
        if (selectedFeatures.length > 0) params.set('feature_ids', selectedFeatures.join(','));

        const response = await apiClient.get(`/cafes?${params.toString()}`);
        allResults = response.success ? response.data : [];
        currentPage = 0;
        renderResults();

        const selectedFeatureData = selectedFeatureButtons.map((tag) => ({
            id: tag.dataset.id,
            label: tag.textContent
        }));

        renderTags(keyword, selectedCity, selectedTime, selectedFeatureData);
    };

    if (keywordInput) {
        keywordInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') loadResults();
        });
    }

    const locationBtn = document.getElementById('filterLocationBtn');
    const featureBtn = document.getElementById('filterFeatureBtn');
    const timeBtn = document.getElementById('filterTimeBtn');

    const closeGroups = () => {
        [locationGroup, featureGroup, timeGroup].forEach((group) => {
            if (group) group.classList.remove('is-open');
        });
        [locationBtn, featureBtn, timeBtn].forEach((btn) => btn?.classList.remove('is-active'));
    };

    const toggleGroup = (group, btn) => {
        if (!group) return;
        const isOpen = group.classList.contains('is-open');
        closeGroups();
        [locationBtn, featureBtn, timeBtn].forEach((item) => item?.classList.remove('is-active'));
        if (!isOpen) {
            group.classList.add('is-open');
            btn?.classList.add('is-active');
        }
    };

    if (locationBtn) {
        locationBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            toggleGroup(locationGroup, locationBtn);
        });
    }

    if (featureBtn) {
        featureBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            toggleGroup(featureGroup, featureBtn);
        });
    }

    if (timeBtn) {
        timeBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            toggleGroup(timeGroup, timeBtn);
        });
    }

    document.addEventListener('click', (event) => {
        if (event.target.closest('.filter-group') || event.target.closest('.search-filter-bar')) {
            return;
        }
        closeGroups();
    });

    if (locationSelect) {
        locationSelect.addEventListener('change', loadResults);
    }

    if (timeSelect) {
        timeSelect.addEventListener('change', loadResults);
    }

    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentPage > 0) {
                currentPage -= 1;
                renderResults();
            }
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const maxPage = Math.floor((allResults.length - 1) / pageSize);
            if (currentPage < maxPage) {
                currentPage += 1;
                renderResults();
            }
        });
    }

    await loadLocations();
    await loadResults();
}

async function initCafeDetailPage() {
    const dict = getLocaleText();
    const cafeParam = getQueryParam('id') || getQueryParam('cafe_id');
    if (!cafeParam) return;

    const cafeResponse = await apiClient.get(`/cafes/${cafeParam}`);
    if (!cafeResponse.success) return;
    const cafe = Array.isArray(cafeResponse.data) ? cafeResponse.data[0] : cafeResponse.data;
    if (!cafe) return;

    const cafeId = Number(cafe.id || cafeParam);
    const nameEl = document.getElementById('detailCafeName');
    const ratingEl = document.getElementById('detailCafeRating');
    const addressEl = document.getElementById('detailCafeAddress');
    const timeTextEl = document.getElementById('detailCafeTimeText');
    const heroImage = document.getElementById('detailHeroImage');
    const menuLink = document.getElementById('detailMenuLink');
    const bookingBtn = document.getElementById('detailBookingBtn');
    const criteriaEl = document.getElementById('detailCriteria');
    const bestsellersEl = document.getElementById('detailBestsellers');
    const reviewListEl = document.getElementById('detailReviewList');
    const moreReviews = document.getElementById('detailMoreReviews');
    const morePhotos = document.getElementById('detailMorePhotos');
    const galleryEdit = document.querySelector('.gallery-edit');
    const editIcons = document.querySelectorAll('.edit-icon, .title-edit-icon, .time-edit-icon');
    const criteriaEdit = document.querySelector('.criteria-box .box-edit');
    const bestsellerEdit = document.querySelector('.bestseller-box .box-edit');
    const favoriteBtn = document.getElementById('detailFavoriteBtn');
    const userId = Number(localStorage.getItem('userId'));
    const isOwner = Number(cafe.owner_id) === userId;
    let isFavorite = false;

    if (nameEl) {
        const titleIcon = nameEl.querySelector('i');
        nameEl.textContent = cafe.name || '---';
        if (titleIcon) nameEl.appendChild(titleIcon);
    }
    if (ratingEl) ratingEl.innerHTML = `<i class="fa-solid fa-star"></i> 0/5`;
    if (addressEl) addressEl.innerHTML = `<strong>${dict.addressLabel}</strong> ${cafe.address || '---'}`;
    if (timeTextEl) {
        timeTextEl.textContent = formatCafeHours(cafe.open_time, cafe.close_time);
    }
    let cafeImages = await getCafeImages(cafeId, cafe.image_url);
    if (heroImage) heroImage.src = (cafeImages[0] || cafe.image_url || 'cafe.png');
    updateGalleryGrid(cafeImages, cafe.image_url);

    if (menuLink) menuLink.addEventListener('click', () => {
        window.location.href = `menu.html?cafe_id=${cafeId}`;
    });

    if (bookingBtn) bookingBtn.addEventListener('click', () => {
        window.location.href = `booking.html?cafe_id=${cafeId}`;
    });

    if (moreReviews) moreReviews.addEventListener('click', () => {
        window.location.href = `reviews.html?cafe_id=${cafeId}`;
    });

    if (morePhotos) {
        morePhotos.addEventListener('click', () => {
            if (cafeImages.length > 0) {
                openGalleryViewer(cafeImages);
            }
        });
    }

    if (favoriteBtn) {
        if (!userId) {
            favoriteBtn.style.display = 'none';
        } else {
            const favoriteResponse = await apiClient.get(`/favorites?user_id=${userId}&cafe_id=${cafeId}`);
            const favorites = favoriteResponse.success ? favoriteResponse.data : [];
            isFavorite = Array.isArray(favorites) && favorites.length > 0;
            favoriteBtn.classList.toggle('is-active', isFavorite);
            favoriteBtn.innerHTML = isFavorite
                ? '<i class="fa-solid fa-heart"></i>'
                : '<i class="fa-regular fa-heart"></i>';

            favoriteBtn.addEventListener('click', async () => {
                if (!userId) {
                    await openAlertModal('Yêu cầu đăng nhập', 'Vui lòng đăng nhập trước.');
                    return;
                }
                if (isFavorite) {
                    const response = await apiClient.delete(`/favorites/${userId}/${cafeId}`);
                    if (response.success) {
                        isFavorite = false;
                    }
                } else {
                    const response = await apiClient.post('/favorites', {
                        user_id: Number(userId),
                        cafe_id: Number(cafeId)
                    });
                    if (response.success) {
                        isFavorite = true;
                    }
                }
                favoriteBtn.classList.toggle('is-active', isFavorite);
                favoriteBtn.innerHTML = isFavorite
                    ? '<i class="fa-solid fa-heart"></i>'
                    : '<i class="fa-regular fa-heart"></i>';
            });
        }
    }

    if (addressEl) {
        addressEl.addEventListener('click', () => {
            window.location.href = `cafe-map.html?cafe_id=${cafeId}`;
        });
    }

    if (!isOwner) {
        editIcons.forEach((icon) => {
            icon.style.display = 'none';
        });
        if (criteriaEdit) criteriaEdit.style.display = 'none';
        if (bestsellerEdit) bestsellerEdit.style.display = 'none';
    } else {
        const titleEdit = document.querySelector('.title-edit-icon');
        const timeEdit = document.querySelector('.time-edit-icon');
        if (titleEdit) {
            titleEdit.addEventListener('click', async () => {
                const result = await openModal({
                    title: 'Cập nhật tên quán',
                    fields: [
                        { name: 'name', label: 'Tên quán mới', value: cafe.name || '' }
                    ],
                    submitText: 'Lưu',
                    cancelText: 'Hủy'
                });
                if (!result || !result.name || !result.name.trim()) return;
                const nextName = result.name.trim();
                const response = await apiClient.put(`/cafes/${cafeId}`, { name: nextName });
                if (response.success && nameEl) {
                    const titleIcon = nameEl.querySelector('i');
                    nameEl.textContent = nextName;
                    if (titleIcon) nameEl.appendChild(titleIcon);
                    cafe.name = nextName;
                }
            });
        }

        if (timeEdit) {
            timeEdit.addEventListener('click', async () => {
                const result = await openModal({
                    title: 'Cập nhật giờ mở cửa',
                    fields: [
                        { name: 'open', label: 'Giờ mở cửa (HH:mm)', type: 'time', value: cafe.open_time || '08:00' },
                        { name: 'close', label: 'Giờ đóng cửa (HH:mm)', type: 'time', value: cafe.close_time || '21:00' }
                    ],
                    submitText: 'Lưu',
                    cancelText: 'Hủy'
                });
                if (!result || !result.open || !result.close) return;
                const open = result.open;
                const close = result.close;
                const response = await apiClient.put(`/cafes/${cafeId}`, { open_time: open, close_time: close });
                if (response.success && timeTextEl) {
                    timeTextEl.textContent = `${open} - ${close}`;
                    cafe.open_time = open;
                    cafe.close_time = close;
                }
            });
        }

        if (addressEl) {
            addressEl.addEventListener('contextmenu', async (event) => {
                event.preventDefault();
                const result = await openModal({
                    title: 'Cập nhật địa chỉ',
                    fields: [
                        { name: 'address', label: 'Địa chỉ mới', value: cafe.address || '' }
                    ],
                    submitText: 'Lưu',
                    cancelText: 'Hủy'
                });
                if (!result || !result.address || !result.address.trim()) return;
                const nextAddress = result.address.trim();
                const response = await apiClient.put(`/cafes/${cafeId}`, { address: nextAddress });
                if (response.success && addressEl) {
                    addressEl.innerHTML = `<strong>${dict.addressLabel}</strong> ${nextAddress}`;
                    cafe.address = nextAddress;
                }
            });
        }

        if (galleryEdit) {
            galleryEdit.addEventListener('click', async () => {
                await openGalleryManager({
                    cafeId,
                    cafe,
                    initialImages: cafeImages,
                    onSave: async (nextImages) => {
                        const response = await saveCafeImages(cafeId, nextImages);
                        if (!response.success) {
                            await openAlertModal('Lá»—i', response.error || 'KhÃ´ng thá»ƒ lÆ°u áº£nh quÃ¡n.');
                            throw new Error(response.error || 'Cannot save cafe images');
                        }
                        cafeImages = [...nextImages];
                        updateGalleryGrid(cafeImages, cafe.image_url);

                        const nextAvatar = cafeImages[0];
                        if (nextAvatar && nextAvatar !== cafe.image_url) {
                            const response = await apiClient.put(`/cafes/${cafeId}`, { image_url: nextAvatar });
                            if (response.success) {
                                cafe.image_url = nextAvatar;
                                if (heroImage) heroImage.src = nextAvatar;
                            } else {
                                await openAlertModal('Lỗi', response.error || 'Không thể cập nhật ảnh đại diện.');
                            }
                        }
                    }
                });
            });
        }

        if (criteriaEdit) {
            criteriaEdit.addEventListener('click', async () => {
                const featureListResponse = await apiClient.get('/features');
                const features = featureListResponse.success ? featureListResponse.data : [];
                const cafeFeatureResponse = await apiClient.get(`/cafe-features?cafe_id=${cafeId}`);
                const currentIds = cafeFeatureResponse.success
                    ? cafeFeatureResponse.data.map((item) => Number(item.feature_id))
                    : [];

                const result = await openChecklistModal({
                    title: 'Chọn tiện ích',
                    options: features.map((item) => ({ id: item.id, label: item.name })),
                    selectedIds: currentIds,
                    submitText: 'Lưu'
                });
                if (!result) return;

                const nextIds = result.map((id) => Number(id));
                const toAdd = nextIds.filter((id) => !currentIds.includes(id));
                const toRemove = currentIds.filter((id) => !nextIds.includes(id));

                await Promise.all([
                    ...toAdd.map((id) => apiClient.post('/cafe-features', { cafe_id: Number(cafeId), feature_id: id })),
                    ...toRemove.map((id) => apiClient.delete(`/cafe-features/${cafeId}/${id}`))
                ]);

                if (criteriaEl) {
                    criteriaEl.innerHTML = '';
                    nextIds.forEach((id) => {
                        const feature = features.find((item) => Number(item.id) === Number(id));
                        const li = document.createElement('li');
                        li.textContent = feature?.name || `Feature ${id}`;
                        criteriaEl.appendChild(li);
                    });
                }
            });
        }

        if (bestsellerEdit) {
            bestsellerEdit.addEventListener('click', async () => {
                const menuResponse = await apiClient.get(`/items?cafe_id=${cafeId}`);
                const items = menuResponse.success ? menuResponse.data : [];
                const currentIds = getCafeBestsellers(cafeId);
                const result = await openChecklistModal({
                    title: 'Chọn đồ uống bán chạy',
                    options: items.map((item) => ({ id: item.id, label: item.name })),
                    selectedIds: currentIds,
                    maxSelect: MAX_BESTSELLERS,
                    submitText: 'Lưu'
                });
                if (!result) return;

                saveCafeBestsellers(cafeId, result);
                if (bestsellersEl) {
                    bestsellersEl.innerHTML = '';
                    result.slice(0, MAX_BESTSELLERS).forEach((id) => {
                        const item = items.find((entry) => Number(entry.id) === Number(id));
                        if (!item) return;
                        const img = document.createElement('img');
                        img.src = item.image_url || 'cafe.png';
                        img.alt = item.name || 'Menu';
                        img.className = 'drink-img';
                        img.onerror = () => { img.src = 'cafe.png'; };
                        bestsellersEl.appendChild(img);
                    });
                }
            });
        }
    }

    const featureResponse = await apiClient.get(`/cafe-features?cafe_id=${cafeId}`);
    const featureIds = featureResponse.success ? featureResponse.data.map((item) => item.feature_id) : [];
    const featureListResponse = await apiClient.get('/features');
    const featureMap = new Map(
        (featureListResponse.success ? featureListResponse.data : []).map((feature) => [feature.id, feature.name])
    );
    if (criteriaEl) {
        criteriaEl.innerHTML = '';
        if (featureIds.length === 0) {
            const li = document.createElement('li');
            li.className = 'empty-state';
            li.textContent = dict.emptyCriteria;
            criteriaEl.appendChild(li);
        } else {
            featureIds.forEach((id) => {
                const li = document.createElement('li');
                li.textContent = featureMap.get(id) || `Feature ${id}`;
                criteriaEl.appendChild(li);
            });
        }
    }

    const menuResponse = await apiClient.get(`/items?cafe_id=${cafeId}`);
    if (bestsellersEl) {
        const menuItems = menuResponse.success ? menuResponse.data : [];
        const selectedBestsellers = getCafeBestsellers(cafeId);
        const displayItems = selectedBestsellers.length > 0
            ? selectedBestsellers
                .map((id) => menuItems.find((item) => Number(item.id) === Number(id)))
                .filter(Boolean)
            : menuItems.slice(0, MAX_BESTSELLERS);

        bestsellersEl.innerHTML = '';
        if (displayItems.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'empty-state';
            empty.textContent = dict.emptyBestsellers;
            bestsellersEl.appendChild(empty);
        } else {
            displayItems.slice(0, MAX_BESTSELLERS).forEach((item) => {
                const img = document.createElement('img');
                img.src = item.image_url || 'cafe.png';
                img.alt = item.name || 'Menu';
                img.className = 'drink-img';
                img.onerror = () => { img.src = 'cafe.png'; };
                bestsellersEl.appendChild(img);
            });
        }
    }

    const reviewResponse = await apiClient.get(`/reviews?cafe_id=${cafeId}`);
    const reviews = reviewResponse.success ? reviewResponse.data : [];
    if (ratingEl) {
        const avgRating = calculateAverageRating(reviews);
        ratingEl.innerHTML = `<i class="fa-solid fa-star"></i> ${avgRating.toFixed(1)}/5`;
    }
    if (reviewListEl) {
        reviewListEl.innerHTML = '';
        if (reviews.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'empty-state';
            empty.textContent = dict.emptyReviews;
            reviewListEl.appendChild(empty);
        } else {
            reviews.slice(0, 2).forEach((review) => {
                const card = document.createElement('div');
                card.className = 'review-card';
                const displayName = review.accounts?.username || review.username || `User ${review.user_id || ''}`;
                card.innerHTML = `
                    <div class="review-card-header">
                        <div class="reviewer-info">
                            <i class="fa-regular fa-circle-user reviewer-icon"></i>
                            <span class="reviewer-name">${displayName}</span>
                        </div>
                        <div class="review-stars">${renderStars(review.rating)}</div>
                    </div>
                    <p class="review-text">${review.content || ''}</p>
                `;
                reviewListEl.appendChild(card);
            });
        }
    }
}

async function initCafeMapPage() {
    const dict = getLocaleText();
    injectHeaderMapLink(document.querySelector('.detail-header .header-icons'));
    const cafeId = getQueryParam('cafe_id');
    const imageEl = document.getElementById('mapCafeImage');
    const nameEl = document.getElementById('mapCafeName');
    const addressEl = document.getElementById('mapCafeAddress');
    const timeEl = document.getElementById('mapCafeTime');
    const ratingEl = document.getElementById('mapCafeRating');
    const mapFrame = document.getElementById('mapFrame');
    const editBtn = document.getElementById('mapCafeEdit');
    const setLocationBtn = document.getElementById('mapSetLocationBtn');
    const viewDetailBtn = document.getElementById('mapViewDetailBtn');
    const locationHintEl = document.getElementById('mapLocationHint');
    const mapSearchInput = document.getElementById('mapLocationSearch');
    const mapSearchBtn = document.getElementById('mapLocationSearchBtn');
    const mapSearchResults = document.getElementById('mapSearchResults');
    const mapSearchPanel = document.getElementById('mapSearchPanel');
    const sidebarEl = document.querySelector('.map-sidebar');
    const userId = Number(localStorage.getItem('userId'));
    let activeCafe = null;
    let mapInstance = null;
    const markerByCafeId = new Map();
    let isEditingSidebar = false;
    let isPlacingLocation = false;
    let placementMarker = null;
    let searchDebounceTimer = null;
    const originalValues = {
        name: '',
        address: '',
        time: ''
    };

    const parseTimeRange = (value) => {
        if (!value) return null;
        const match = value.match(/(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/);
        if (!match) return null;
        return { open: match[1], close: match[2] };
    };

    const setSidebarEditable = (enabled) => {
        if (!nameEl || !addressEl || !timeEl) return;
        nameEl.contentEditable = String(enabled);
        addressEl.contentEditable = String(enabled);
        timeEl.contentEditable = String(enabled);
        nameEl.classList.toggle('is-editable', enabled);
        addressEl.classList.toggle('is-editable', enabled);
        timeEl.classList.toggle('is-editable', enabled);
        if (sidebarEl) sidebarEl.classList.toggle('is-editing', enabled);
        if (editBtn) editBtn.classList.toggle('is-active', enabled);
    };
    const normalizeCoordinates = (cafe) => {
        const rawLat = Number(cafe?.latitude);
        const rawLng = Number(cafe?.longitude);
        if (!Number.isFinite(rawLat) || !Number.isFinite(rawLng)) return null;
        const latInRange = Math.abs(rawLat) <= 90;
        const lngInRange = Math.abs(rawLng) <= 180;
        if (latInRange && lngInRange) return { lat: rawLat, lng: rawLng };
        const swapLat = rawLng;
        const swapLng = rawLat;
        const swapLatOk = Math.abs(swapLat) <= 90;
        const swapLngOk = Math.abs(swapLng) <= 180;
        if (swapLatOk && swapLngOk) return { lat: swapLat, lng: swapLng };
        return null;
    };

    const geocodeAddress = async (address, city) => {
        const resolvedCity = (city && String(city).trim()) || DEFAULT_GEOCODE_CITY;
        const query = [address, resolvedCity, DEFAULT_GEOCODE_COUNTRY].filter(Boolean).join(', ');
        if (!query) return null;
        const results = await searchLocationsInVietnam(query);
        if (results.length === 0) return null;
        const lat = Number(results[0].lat);
        const lng = Number(results[0].lon);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
        return {
            lat,
            lng,
            address: results[0].display_name || address,
            city: results[0].address?.city || results[0].address?.town || resolvedCity
        };
    };

    const persistCafeLocation = async (cafe, coords, addressText, cityName) => {
        if (!cafe || !coords || Number(cafe.owner_id) !== userId || !userId) return false;
        const payload = {
            latitude: coords.lat,
            longitude: coords.lng
        };
        if (addressText) payload.address = addressText;
        if (cityName) payload.city = cityName;
        const response = await apiClient.put(`/cafes/${cafe.id}`, payload);
        if (!response.success) return false;
        cafe.latitude = coords.lat;
        cafe.longitude = coords.lng;
        if (addressText) cafe.address = addressText;
        if (cityName) cafe.city = cityName;
        return true;
    };

    const cafeResponse = cafeId
        ? await apiClient.get(`/cafes/${cafeId}`)
        : await apiClient.get('/cafes');
    if (!cafeResponse.success) {
        await openAlertModal('Lỗi', cafeResponse.error || dict.mapLoadError);
        return;
    }

    const cafes = cafeId ? [cafeResponse.data] : (cafeResponse.data || []);
    if (cafes.length === 0) {
        await openAlertModal('Thông báo', dict.mapEmpty);
        return;
    }

    const pickDefaultCenter = (list, coordsMap) => {
        const withCoords = list.find((item) => coordsMap.has(Number(item.id)));
        if (withCoords) {
            const coords = coordsMap.get(Number(withCoords.id));
            return [coords.lat, coords.lng];
        }
        return VIETNAM_MAP_CENTER;
    };

    const updateSidebar = async (cafe) => {
        if (!cafe) return;
        activeCafe = cafe;
        if (imageEl) imageEl.src = cafe.image_url || 'cafe.png';
        if (nameEl) nameEl.textContent = cafe.name || '---';
        if (addressEl) addressEl.textContent = cafe.address || '---';
        if (timeEl) timeEl.textContent = formatCafeHours(cafe.open_time, cafe.close_time);
        if (ratingEl) ratingEl.innerHTML = `<i class="fa-solid fa-star"></i> 0/5`;

        if (viewDetailBtn) {
            viewDetailBtn.href = `cafe-detail.html?id=${cafe.id}`;
            viewDetailBtn.textContent = dict.mapViewDetail;
            viewDetailBtn.classList.remove('hidden');
        }

        const isOwner = Number(cafe.owner_id) === userId;
        const isTargetCafe = cafeId && String(cafe.id) === String(cafeId);
        if (setLocationBtn) {
            const showSetLocation = isOwner && isTargetCafe;
            setLocationBtn.classList.toggle('hidden', !showSetLocation);
            setLocationBtn.textContent = isPlacingLocation ? dict.mapSetLocationActive : dict.mapSetLocation;
            setLocationBtn.classList.toggle('is-active', isPlacingLocation);
        }
        if (locationHintEl) {
            const showHint = isOwner && isTargetCafe;
            locationHintEl.textContent = isPlacingLocation ? dict.mapSetLocationActive : dict.mapSetLocationHint;
            locationHintEl.classList.toggle('hidden', !showHint);
        }
        if (editBtn) {
            editBtn.style.display = isOwner ? 'block' : 'none';
            if (isOwner) {
                editBtn.onclick = async () => {
                    if (!nameEl || !addressEl || !timeEl) return;
                    if (!isEditingSidebar) {
                        originalValues.name = nameEl.textContent.trim();
                        originalValues.address = addressEl.textContent.trim();
                        originalValues.time = timeEl.textContent.trim();
                        isEditingSidebar = true;
                        setSidebarEditable(true);
                        return;
                    }

                    const confirmed = await openConfirmModal('Lưu thay đổi', 'Bạn muốn lưu thay đổi?');
                    if (!confirmed) {
                        nameEl.textContent = originalValues.name;
                        addressEl.textContent = originalValues.address;
                        timeEl.textContent = originalValues.time;
                        isEditingSidebar = false;
                        setSidebarEditable(false);
                        return;
                    }

                    const nextName = nameEl.textContent.trim() || cafe.name;
                    const nextAddress = addressEl.textContent.trim() || cafe.address;
                    const timeRange = parseTimeRange(timeEl.textContent.trim());
                    if (!timeRange) {
                        await openAlertModal('Lỗi', 'Giờ hoạt động phải theo định dạng HH:mm - HH:mm.');
                        return;
                    }

                    const nextPayload = {
                        name: nextName,
                        address: nextAddress,
                        open_time: timeRange.open,
                        close_time: timeRange.close
                    };
                    const response = await apiClient.put(`/cafes/${cafe.id}`, nextPayload);
                    if (response.success) {
                        const updated = Array.isArray(response.data) ? response.data[0] : response.data;
                        Object.assign(cafe, updated || nextPayload);
                        isEditingSidebar = false;
                        setSidebarEditable(false);
                        await updateSidebar(cafe);
                    } else {
                        await openAlertModal('Lỗi', response.error || 'Không thể cập nhật quán.');
                    }
                };
            }
        }

        const reviewResponse = await apiClient.get(`/reviews?cafe_id=${cafe.id}`);
        const reviews = reviewResponse.success ? reviewResponse.data : [];
        if (ratingEl) {
            const avgRating = calculateAverageRating(reviews);
            ratingEl.innerHTML = `<i class="fa-solid fa-star"></i> ${avgRating.toFixed(1)}/5`;
        }
    };

    const coordsByCafeId = new Map();
    cafes.forEach((cafe) => {
        const coords = normalizeCoordinates(cafe);
        if (coords) coordsByCafeId.set(Number(cafe.id), coords);
    });

    for (const cafe of cafes) {
        if (coordsByCafeId.has(Number(cafe.id))) continue;
        const geocoded = await geocodeAddress(cafe.address, cafe.city);
        if (!geocoded) continue;
        coordsByCafeId.set(Number(cafe.id), { lat: geocoded.lat, lng: geocoded.lng });
        await persistCafeLocation(cafe, geocoded, geocoded.address, geocoded.city);
    }

    const primaryCafe = cafeId
        ? cafes.find((entry) => String(entry.id) === String(cafeId)) || cafes[0]
        : cafes[0];

    if (cafeId && primaryCafe && !coordsByCafeId.has(Number(primaryCafe.id))) {
        await openAlertModal('Thông báo', dict.mapGeocodeFailed);
    }

    if (typeof L === 'undefined' || !mapFrame) {
        await updateSidebar(primaryCafe);
        return;
    }

    const center = cafeId && coordsByCafeId.has(Number(cafeId))
        ? coordsByCafeId.get(Number(cafeId))
        : null;
    const hasCafeCenter = Boolean(center);
    const initialZoom = hasCafeCenter
        ? VIETNAM_CAFE_ZOOM
        : (coordsByCafeId.size > 0 ? 12 : VIETNAM_MAP_ZOOM);
    mapInstance = L.map(mapFrame).setView(
        hasCafeCenter ? [center.lat, center.lng] : pickDefaultCenter(cafes, coordsByCafeId),
        initialZoom
    );
    const vietnamBounds = getVietnamBounds();
    if (vietnamBounds) {
        mapInstance.setMaxBounds(vietnamBounds.pad(0.05));
        mapInstance.setMinZoom(5);
    }
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(mapInstance);

    if (mapSearchInput) {
        mapSearchInput.placeholder = dict.mapSearchPlaceholder;
    }
    if (mapSearchBtn) {
        mapSearchBtn.textContent = dict.mapSearchBtn;
    }

    const upsertMarker = (cafe, coords) => {
        let marker = markerByCafeId.get(Number(cafe.id));
        if (!marker) {
            marker = L.marker([coords.lat, coords.lng]).addTo(mapInstance);
            marker.on('click', () => {
                updateSidebar(cafe);
                mapInstance.setView([coords.lat, coords.lng], 15);
            });
            markerByCafeId.set(Number(cafe.id), marker);
        } else {
            marker.setLatLng([coords.lat, coords.lng]);
        }
        return marker;
    };

    cafes.forEach((cafe) => {
        const coords = coordsByCafeId.get(Number(cafe.id));
        if (!coords) return;
        upsertMarker(cafe, coords);
    });

    const targetCafe = cafeId ? cafes.find((entry) => String(entry.id) === String(cafeId)) : null;
    const canEditLocation = targetCafe && Number(targetCafe.owner_id) === userId;
    if (targetCafe) activeCafe = targetCafe;

    const hideSearchResults = () => {
        if (mapSearchResults) {
            mapSearchResults.innerHTML = '';
            mapSearchResults.classList.add('hidden');
        }
    };

    const showPlacementMarker = (lat, lng) => {
        if (!mapInstance) return;
        if (placementMarker) {
            placementMarker.setLatLng([lat, lng]);
        } else {
            placementMarker = L.marker([lat, lng], { draggable: canEditLocation }).addTo(mapInstance);
            if (canEditLocation) {
                placementMarker.on('dragend', async () => {
                    const pos = placementMarker.getLatLng();
                    const reversed = await reverseGeocodeLocation(pos.lat, pos.lng);
                    await applySelectedLocation(
                        pos.lat,
                        pos.lng,
                        reversed?.display || addressEl?.textContent || '',
                        reversed?.city || activeCafe?.city
                    );
                });
            }
        }
    };

    const setMapCafeAddress = (text) => {
        const value = (text || '').trim() || '---';
        if (addressEl) addressEl.textContent = value;
        if (activeCafe && value !== '---') activeCafe.address = value;
    };

    const applySelectedLocation = async (lat, lng, addressText, cityName, options = {}) => {
        const { skipConfirm = false, skipSave = false } = options;
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;

        const cafeForSave = activeCafe || targetCafe;
        const isOwnerOfCafe = cafeForSave && Number(cafeForSave.owner_id) === userId && userId;
        const shouldSave = !skipSave && isOwnerOfCafe;

        if (shouldSave && !skipConfirm) {
            const confirmed = await openConfirmModal('Chọn vị trí', 'Lưu vị trí và địa chỉ này cho quán?');
            if (!confirmed) return false;
        }

        let resolvedAddress = (addressText || '').trim();
        let resolvedCity = cityName || cafeForSave?.city || null;
        if (!resolvedAddress) {
            const reversed = await reverseGeocodeLocation(lat, lng);
            resolvedAddress = reversed?.display || resolvedAddress;
            resolvedCity = reversed?.city || resolvedCity;
        }

        if (cafeForSave) activeCafe = cafeForSave;
        setMapCafeAddress(resolvedAddress);

        const coords = { lat, lng };
        if (cafeForSave) {
            coordsByCafeId.set(Number(cafeForSave.id), coords);
            upsertMarker(cafeForSave, coords);
        }
        showPlacementMarker(lat, lng);
        mapInstance.setView([lat, lng], VIETNAM_CAFE_ZOOM);

        if (shouldSave && cafeForSave) {
            const saved = await persistCafeLocation(
                cafeForSave,
                coords,
                resolvedAddress,
                resolvedCity
            );
            if (!saved) {
                await openAlertModal('Lỗi', 'Không thể lưu vị trí. Vui lòng đăng nhập với tài khoản chủ quán.');
                return false;
            }
        }

        isPlacingLocation = false;
        if (setLocationBtn) {
            setLocationBtn.textContent = dict.mapSetLocation;
            setLocationBtn.classList.remove('is-active');
        }
        if (locationHintEl) {
            locationHintEl.textContent = dict.mapSearchSelectHint;
        }
        mapInstance.getContainer().classList.remove('map-placing-mode');
        hideSearchResults();
        return true;
    };

    const renderSearchResults = (items) => {
        if (!mapSearchResults) return;
        mapSearchResults.innerHTML = '';
        if (!items.length) {
            const empty = document.createElement('li');
            empty.className = 'map-search-result-empty';
            empty.textContent = dict.mapSearchNoResults;
            mapSearchResults.appendChild(empty);
            mapSearchResults.classList.remove('hidden');
            return;
        }
        items.forEach((item) => {
            const li = document.createElement('li');
            li.className = 'map-search-result-item';
            li.setAttribute('role', 'option');
            li.textContent = item.display_name;
            li.addEventListener('click', async () => {
                const lat = Number(item.lat);
                const lng = Number(item.lon);
                const city = item.address?.city || item.address?.town || item.address?.state || null;
                if (mapSearchInput) mapSearchInput.value = item.display_name || '';
                await applySelectedLocation(lat, lng, item.display_name, city);
            });
            mapSearchResults.appendChild(li);
        });
        mapSearchResults.classList.remove('hidden');
    };

    const runMapSearch = async () => {
        const query = mapSearchInput?.value.trim() || '';
        if (!query) {
            hideSearchResults();
            return;
        }
        const results = await searchLocationsInVietnam(query);
        renderSearchResults(results);
    };

    if (mapSearchPanel) {
        mapSearchPanel.classList.toggle('hidden', !canEditLocation);
    }

    if (canEditLocation) {
        if (mapSearchBtn) {
            mapSearchBtn.addEventListener('click', runMapSearch);
        }
        if (mapSearchInput) {
            mapSearchInput.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    runMapSearch();
                }
            });
            mapSearchInput.addEventListener('input', () => {
                clearTimeout(searchDebounceTimer);
                searchDebounceTimer = setTimeout(runMapSearch, 450);
            });
        }
    }

    if (setLocationBtn && canEditLocation) {
        setLocationBtn.addEventListener('click', () => {
            isPlacingLocation = !isPlacingLocation;
            setLocationBtn.textContent = isPlacingLocation ? dict.mapSetLocationActive : dict.mapSetLocation;
            setLocationBtn.classList.toggle('is-active', isPlacingLocation);
            if (locationHintEl) {
                locationHintEl.textContent = isPlacingLocation
                    ? dict.mapSetLocationActive
                    : dict.mapSearchSelectHint;
            }
            mapInstance.getContainer().classList.toggle('map-placing-mode', isPlacingLocation);
        });

        mapInstance.on('click', async (event) => {
            if (!isPlacingLocation) return;
            const { lat, lng } = event.latlng || {};
            if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
            const reversed = await reverseGeocodeLocation(lat, lng);
            await applySelectedLocation(
                lat,
                lng,
                reversed?.display || '',
                reversed?.city || activeCafe?.city
            );
        });
    }

    if (primaryCafe && coordsByCafeId.has(Number(primaryCafe.id))) {
        const primaryCoords = coordsByCafeId.get(Number(primaryCafe.id));
        showPlacementMarker(primaryCoords.lat, primaryCoords.lng);
    }

    await updateSidebar(primaryCafe);
    if (locationHintEl && canEditLocation) {
        locationHintEl.textContent = dict.mapSearchSelectHint;
        locationHintEl.classList.remove('hidden');
    }
}

async function initMenuPage() {
    const cafeId = getQueryParam('cafe_id');
    const menuList = document.getElementById('menuList');
    const detailName = document.getElementById('detailName');
    const detailDescription = document.getElementById('detailDescription');
    const detailPrice = document.getElementById('detailPrice');
    const detailImage = document.getElementById('detailImage');
    const detailRating = document.getElementById('detailRating');
    const menuReviewList = document.getElementById('menuReviewList');
    const submitReview = document.getElementById('submitMenuReview');
    const addBtn = document.getElementById('menuAddBtn');
    let currentItemId = null;
    let currentRating = 0;
    let currentReviewId = null;
    let isOwner = false;
    const toolbar = document.querySelector('.menu-toolbar');

    document.addEventListener('click', () => {
        document.querySelectorAll('.menu-card-action-menu.is-open').forEach((menu) => {
            menu.classList.remove('is-open');
        });
    });

    const updateStarColors = (value) => {
        if (!detailRating) return;
        detailRating.querySelectorAll('i').forEach((star, index) => {
            star.style.color = index < value ? '#f1c40f' : '#ccc';
        });
    };

    const loadMenuReviews = async (itemId, container) => {
        const dict = getLocaleText();
        if (!itemId || !container) return;
        const reviewResponse = await apiClient.get(`/menu-reviews?menu_item_id=${itemId}`);
        const reviews = reviewResponse.success ? reviewResponse.data : [];
        if (reviews.length === 0) {
            container.innerHTML = `<div class="menu-review-item">${dict.menuEmptyReviews}</div>`;
            return;
        }
        const latestByUser = new Map();
        reviews.forEach((review) => {
            const key = Number(review.user_id) || 0;
            const existing = latestByUser.get(key);
            if (!existing) {
                latestByUser.set(key, review);
                return;
            }
            const existingTime = new Date(existing.created_at || 0).getTime();
            const nextTime = new Date(review.created_at || 0).getTime();
            if (nextTime >= existingTime) {
                latestByUser.set(key, review);
            }
        });

        const deduped = Array.from(latestByUser.values()).sort((a, b) => {
            const timeA = new Date(a.created_at || 0).getTime();
            const timeB = new Date(b.created_at || 0).getTime();
            return timeB - timeA;
        });

        container.innerHTML = '';
        deduped.forEach((review) => {
            const item = document.createElement('div');
            item.className = 'menu-review-item';
            item.innerHTML = `
                <div class="menu-review-meta">
                    <span>User ${review.user_id || ''}</span>
                    <span>${renderStars(review.rating)}</span>
                </div>
                <div class="menu-review-text">${review.content || ''}</div>
            `;
            container.appendChild(item);
        });
    };

    const loadMenuAverageRatings = async (menuItems) => {
        if (!Array.isArray(menuItems) || menuItems.length === 0) return;
        const averages = await Promise.all(menuItems.map(async (item) => {
            const reviewResponse = await apiClient.get(`/menu-reviews?menu_item_id=${item.id}`);
            const reviews = reviewResponse.success ? reviewResponse.data : [];
            const total = reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0);
            const avg = reviews.length > 0 ? total / reviews.length : 0;
            return { id: item.id, avg };
        }));

        averages.forEach(({ id, avg }) => {
            const ratingEl = document.querySelector(`.menu-card-rating[data-item-id="${id}"]`);
            if (ratingEl) {
                ratingEl.innerHTML = `${renderStars(avg)} <span class="menu-card-score">${avg.toFixed(1)}</span>`;
            }
        });
    };

    const loadUserMenuReview = async (itemId) => {
        const userId = localStorage.getItem('userId');
        if (!itemId || !userId) {
            currentReviewId = null;
            currentRating = 0;
            updateStarColors(0);
            return;
        }
        const response = await apiClient.get(`/menu-reviews?menu_item_id=${itemId}&user_id=${userId}`);
        const reviews = response.success ? response.data : [];
        if (reviews.length > 0) {
            const latest = reviews.reduce((acc, next) => {
                if (!acc) return next;
                const accTime = new Date(acc.created_at || 0).getTime();
                const nextTime = new Date(next.created_at || 0).getTime();
                return nextTime >= accTime ? next : acc;
            }, null);
            currentReviewId = latest?.id || null;
            currentRating = Number(latest?.rating) || 0;
            updateStarColors(currentRating);
        } else {
            currentReviewId = null;
            currentRating = 0;
            updateStarColors(0);
        }
    };

    if (cafeId) {
        const cafeResponse = await apiClient.get(`/cafes/${cafeId}`);
        const cafe = cafeResponse.success ? cafeResponse.data : null;
        const userId = Number(localStorage.getItem('userId'));
        isOwner = cafe && Number(cafe.owner_id) === userId;
        if (addBtn) addBtn.style.display = isOwner ? 'inline-flex' : 'none';
    }
    if (addBtn && !isOwner) {
        addBtn.style.display = 'none';
    }

    const response = await apiClient.get(`/items${cafeId ? `?cafe_id=${cafeId}` : ''}`);
    const items = response.success ? response.data : [];
    if (menuList) {
        menuList.innerHTML = '';
        if (toolbar) menuList.appendChild(toolbar);
        items.forEach((item) => {
            const card = document.createElement('div');
            card.className = 'menu-card';
            card.innerHTML = `
                <img src="${item.image_url || 'cafe.png'}" alt="${item.name}">
                <div class="menu-card-info">
                    <strong>${item.name}</strong>
                    <span>${item.price || ''}</span>
                    <span class="menu-card-rating" data-item-id="${item.id}">${renderStars(0)} <span class="menu-card-score">0.0</span></span>
                </div>
            `;
            if (isOwner) {
                const actions = document.createElement('div');
                actions.className = 'menu-card-actions';
                const menuToggle = document.createElement('button');
                menuToggle.className = 'menu-card-action-toggle';
                menuToggle.type = 'button';
                menuToggle.setAttribute('aria-label', 'Tuy chon mon');
                menuToggle.innerHTML = '<i class="fa-solid fa-ellipsis-vertical"></i>';

                const actionMenu = document.createElement('div');
                actionMenu.className = 'menu-card-action-menu';

                menuToggle.addEventListener('click', (event) => {
                    event.stopPropagation();
                    document.querySelectorAll('.menu-card-action-menu.is-open').forEach((menu) => {
                        if (menu !== actionMenu) menu.classList.remove('is-open');
                    });
                    actionMenu.classList.toggle('is-open');
                });
                
                const editBtn = document.createElement('button');
                editBtn.className = 'menu-edit-btn';
                editBtn.textContent = getLocaleText().editLabel;
                editBtn.addEventListener('click', async (event) => {
                    event.stopPropagation();
                    actionMenu.classList.remove('is-open');
                    const result = await openModal({
                        title: 'Sửa món',
                        fields: [
                            { name: 'name', label: 'Tên món', value: item.name || '' },
                            { name: 'description', label: 'Mô tả', type: 'textarea', value: item.description || '' },
                            { name: 'price', label: 'Giá', type: 'number', value: item.price || '' },
                            { name: 'imageUrl', label: 'URL ảnh', value: item.image_url || '' }
                        ],
                        submitText: getLocaleText().updateLabel,
                        cancelText: 'Hủy'
                    });
                    if (!result || !result.name || !result.name.trim()) return;
                    const name = result.name.trim();
                    const description = result.description ? result.description.trim() : '';
                    const imageUrl = result.imageUrl ? result.imageUrl.trim() : '';
                    let priceValue = null;
                    if (result.price) {
                        priceValue = Number(result.price);
                        if (Number.isNaN(priceValue)) {
                            await openAlertModal('Lỗi', 'Giá không hợp lệ.');
                            return;
                        }
                    }
                    const payload = {
                        name,
                        description,
                        price: priceValue,
                        image_url: imageUrl
                    };
                    const response = await apiClient.put(`/items/${item.id}`, payload);
                    if (response.success) {
                        window.location.reload();
                    } else {
                        await openAlertModal('Lỗi', response.error || 'Không thể cập nhật món.');
                    }
                });
                actionMenu.appendChild(editBtn);
                
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'menu-delete-btn';
                deleteBtn.textContent = getLocaleText().deleteLabel;
                deleteBtn.addEventListener('click', async (event) => {
                    event.stopPropagation();
                    const confirmed = await openConfirmModal('Xóa món', 'Xóa món này?');
                    if (!confirmed) return;
                    const response = await apiClient.delete(`/items/${item.id}`);
                    if (response.success) {
                        card.remove();
                    } else {
                        await openAlertModal('Lỗi', response.error || 'Không thể xóa món.');
                    }
                });
                actionMenu.appendChild(deleteBtn);
                actions.appendChild(menuToggle);
                actions.appendChild(actionMenu);
                card.appendChild(actions);
            }
            card.addEventListener('click', () => {
                currentItemId = item.id;
                if (detailName) detailName.textContent = item.name;
                if (detailDescription) detailDescription.textContent = item.description || '';
                if (detailPrice) detailPrice.textContent = item.price ? `${item.price}` : '';
                if (detailImage) detailImage.src = item.image_url || 'cafe.png';
                if (menuReviewList) {
                    loadMenuReviews(item.id, menuReviewList);
                }
                loadUserMenuReview(item.id);
            });
            menuList.appendChild(card);
        });

        if (items.length > 0) {
            const firstItem = items[0];
            currentItemId = firstItem.id;
            if (detailName) detailName.textContent = firstItem.name;
            if (detailDescription) detailDescription.textContent = firstItem.description || '';
            if (detailPrice) detailPrice.textContent = firstItem.price ? `${firstItem.price}` : '';
            if (detailImage) detailImage.src = firstItem.image_url || 'cafe.png';
            if (menuReviewList) {
                loadMenuReviews(firstItem.id, menuReviewList);
            }
            loadUserMenuReview(firstItem.id);
        }

        loadMenuAverageRatings(items);
    }

    if (addBtn && isOwner) {
        addBtn.addEventListener('click', async () => {
            const result = await openModal({
                title: 'Thêm món mới',
                fields: [
                    { name: 'name', label: 'Tên món', value: '' },
                    { name: 'description', label: 'Mô tả', type: 'textarea', value: '' },
                    { name: 'price', label: 'Giá', type: 'number', value: '' },
                    { name: 'imageUrl', label: 'URL ảnh', value: '' }
                ],
                submitText: 'Thêm',
                cancelText: 'Hủy'
            });
            if (!result || !result.name || !result.name.trim()) return;
            const name = result.name.trim();
            const description = result.description ? result.description.trim() : '';
            const imageUrl = result.imageUrl ? result.imageUrl.trim() : '';
            let priceValue = null;
            if (result.price) {
                priceValue = Number(result.price);
                if (Number.isNaN(priceValue)) {
                    await openAlertModal('Lỗi', 'Giá không hợp lệ.');
                    return;
                }
            }
            const payload = {
                cafe_id: Number(cafeId),
                name,
                description,
                price: priceValue,
                image_url: imageUrl
            };
            const response = await apiClient.post('/items', payload);
            if (response.success) {
                window.location.reload();
            } else {
                await openAlertModal('Lỗi', response.error || 'Không thể thêm món.');
            }
        });
    }

    if (detailRating) {
        detailRating.innerHTML = '';
        for (let i = 1; i <= 5; i += 1) {
            const star = document.createElement('i');
            star.className = 'fa-solid fa-star';
            star.style.color = i <= currentRating ? '#f1c40f' : '#ccc';
            star.addEventListener('click', () => {
                currentRating = i;
                updateStarColors(i);
            });
            detailRating.appendChild(star);
        }
    }

    if (submitReview) {
        submitReview.addEventListener('click', async () => {
            if (!currentItemId) {
                await openAlertModal('Thiếu thông tin', 'Vui lòng chọn món ăn.');
                return;
            }
            const userId = localStorage.getItem('userId');
            if (!userId) {
                await openAlertModal('Yêu cầu đăng nhập', 'Vui lòng đăng nhập trước.');
                return;
            }
            const payload = {
                user_id: Number(userId),
                menu_item_id: currentItemId,
                rating: currentRating || 5,
                content: ''
            };
            const result = currentReviewId
                ? await apiClient.put(`/menu-reviews/${currentReviewId}`, { rating: payload.rating, content: payload.content })
                : await apiClient.post('/menu-reviews', payload);
            if (result.success) {
                if (!currentReviewId && result.data?.id) {
                    currentReviewId = result.data.id;
                }
                await loadUserMenuReview(currentItemId);
                await openAlertModal('Thành công', 'Đã gửi đánh giá.');
                if (menuReviewList) {
                    await loadMenuReviews(currentItemId, menuReviewList);
                }
            } else {
                await openAlertModal('Lỗi', result.error || 'Không thể gửi đánh giá.');
            }
        });
    }
}

async function initReviewsPage() {
    const cafeId = getQueryParam('cafe_id');
    const averageRating = document.getElementById('averageRating');
    const ratingBars = document.getElementById('ratingBars');
    const reviewsList = document.getElementById('reviewsList');
    const reviewContent = document.getElementById('reviewContent');
    const submitReview = document.getElementById('submitReview');
    const ratingSelector = document.getElementById('reviewRatingSelector');
    const currentUserName = document.getElementById('currentUserName');
    const reviewsCafeImage = document.getElementById('reviewsCafeImage');
    const userId = localStorage.getItem('userId');
    const language = localStorage.getItem('language') || 'vi';
    let selectedRating = 5;
    let currentReviewId = null;

    if (cafeId && reviewsCafeImage) {
        const cafeResponse = await apiClient.get(`/cafes/${cafeId}`);
        const cafe = cafeResponse.success
            ? (Array.isArray(cafeResponse.data) ? cafeResponse.data[0] : cafeResponse.data)
            : null;
        const cafeImages = await getCafeImages(cafeId, cafe?.image_url);
        reviewsCafeImage.src = cafeImages[0] || cafe?.image_url || 'cafe.png';
        reviewsCafeImage.alt = cafe?.name || 'Cafe';
        reviewsCafeImage.onerror = () => { reviewsCafeImage.src = 'cafe.png'; };
    }

    const updateRatingSelector = (value) => {
        selectedRating = value;
        if (!ratingSelector) return;
        ratingSelector.querySelectorAll('i').forEach((star, index) => {
            star.style.color = index < selectedRating ? '#f1c40f' : '#ccc';
        });
    };

    if (ratingSelector) {
        ratingSelector.innerHTML = '';
        for (let i = 1; i <= 5; i += 1) {
            const star = document.createElement('i');
            star.className = 'fa-solid fa-star';
            star.style.color = i <= selectedRating ? '#f1c40f' : '#ccc';
            star.addEventListener('click', () => {
                updateRatingSelector(i);
            });
            ratingSelector.appendChild(star);
        }
    }

    if (currentUserName) {
        currentUserName.textContent = localStorage.getItem('username') || 'User';
    }

    if (userId && currentUserName) {
        const accountResponse = await apiClient.get(`/accounts/${userId}`);
        if (accountResponse.success && accountResponse.data?.username) {
            currentUserName.textContent = accountResponse.data.username;
        }
    }

    const response = await apiClient.get(`/reviews${cafeId ? `?cafe_id=${cafeId}` : ''}`);
    const reviews = response.success ? response.data : [];
    const latestByUser = new Map();
    reviews.forEach((review) => {
        const key = Number(review.user_id) || 0;
        if (!latestByUser.has(key)) {
            latestByUser.set(key, review);
            return;
        }
        const current = latestByUser.get(key);
        const currentTime = new Date(current.created_at || 0).getTime();
        const nextTime = new Date(review.created_at || 0).getTime();
        if (nextTime >= currentTime) {
            latestByUser.set(key, review);
        }
    });
    const dedupedReviews = Array.from(latestByUser.values())
        .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
    const total = dedupedReviews.length;
    const average = total > 0
        ? (dedupedReviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / total)
        : 0;
    if (averageRating) averageRating.textContent = average.toFixed(1);

    if (ratingBars) {
        ratingBars.innerHTML = '';
        for (let star = 5; star >= 1; star -= 1) {
            const count = dedupedReviews.filter((r) => Number(r.rating) === star).length;
            const percent = total > 0 ? (count / total) * 100 : 0;
            const bar = document.createElement('div');
            bar.className = 'rating-bar';
            bar.innerHTML = `
                <span>${star}★</span>
                <div class="rating-bar-track"><div class="rating-bar-fill" style="width: ${percent}%;"></div></div>
                <span>${count}</span>
            `;
            ratingBars.appendChild(bar);
        }
    }

    if (reviewsList) {
        reviewsList.innerHTML = '';
        dedupedReviews.forEach((review) => {
            const item = document.createElement('div');
            item.className = 'review-item';
            const displayName = review.accounts?.username || review.username || `User ${review.user_id || ''}`;
            const isOwnReview = userId && Number(review.user_id) === Number(userId);
            const editLabel = language === 'jp' ? '編集' : 'Chỉnh sửa';
            item.innerHTML = `
                <div class="review-item-header">
                    <div class="reviewer-info">
                        <i class="fa-regular fa-circle-user reviewer-icon"></i>
                        <span class="reviewer-name">${displayName}</span>
                    </div>
                    <div class="review-item-actions">
                        <div class="review-stars">${renderStars(review.rating)}</div>
                        ${isOwnReview ? `<button class="review-edit-btn" data-review-id="${review.id}">${editLabel}</button>` : ''}
                    </div>
                </div>
                <div class="review-bubble">${review.content || ''}</div>
            `;
            reviewsList.appendChild(item);
        });
    }

    if (userId) {
        const ownReview = dedupedReviews.find((review) => Number(review.user_id) === Number(userId));
        if (ownReview) {
            currentReviewId = ownReview.id || null;
            if (reviewContent) reviewContent.value = ownReview.content || '';
            updateRatingSelector(Number(ownReview.rating) || 5);
            if (submitReview) submitReview.textContent = language === 'jp' ? '更新' : 'Cập nhật';
        }
    }

    if (reviewsList && reviewContent) {
        reviewsList.querySelectorAll('.review-edit-btn').forEach((button) => {
            button.addEventListener('click', () => {
                const reviewId = Number(button.dataset.reviewId);
                const targetReview = dedupedReviews.find((review) => Number(review.id) === reviewId);
                if (!targetReview) return;
                currentReviewId = targetReview.id || null;
                reviewContent.value = targetReview.content || '';
                updateRatingSelector(Number(targetReview.rating) || 5);
                if (submitReview) submitReview.textContent = language === 'jp' ? '更新' : 'Cập nhật';
                reviewContent.focus();
            });
        });
    }

    if (submitReview) {
        submitReview.addEventListener('click', async () => {
            if (!userId) {
                await openAlertModal('Yêu cầu đăng nhập', 'Vui lòng đăng nhập trước.');
                return;
            }
            const payload = {
                user_id: Number(userId),
                cafe_id: cafeId ? Number(cafeId) : null,
                rating: selectedRating,
                content: reviewContent?.value || ''
            };
            const result = currentReviewId
                ? await apiClient.put(`/reviews/${currentReviewId}`, { rating: payload.rating, content: payload.content })
                : await apiClient.post('/reviews', payload);
            if (result.success) {
                window.location.reload();
            } else {
                await openAlertModal('Lỗi', result.error || 'Không thể gửi đánh giá.');
            }
        });
    }
}

async function initBookingPage() {
    const bookingTime = document.getElementById('bookingTime');
    const bookingForm = document.getElementById('bookingForm');
    const bookingDate = document.getElementById('bookingDate');
    const bookingPeople = document.getElementById('bookingPeople');
    const bookingNote = document.getElementById('bookingNote');
    const bookingCafeImage = document.getElementById('bookingCafeImage');
    const cafeId = getQueryParam('cafe_id');

    buildTimeOptions(bookingTime);

    if (cafeId && bookingCafeImage) {
        const cafeResponse = await apiClient.get(`/cafes/${cafeId}`);
        const cafe = cafeResponse.success
            ? (Array.isArray(cafeResponse.data) ? cafeResponse.data[0] : cafeResponse.data)
            : null;
        const cafeImages = await getCafeImages(cafeId, cafe?.image_url);
        bookingCafeImage.src = cafeImages[0] || cafe?.image_url || 'cafe.png';
        bookingCafeImage.alt = cafe?.name || 'Cafe';
        bookingCafeImage.onerror = () => { bookingCafeImage.src = 'cafe.png'; };
    }

    if (bookingDate) {
        const today = new Date();
        const maxDate = new Date();
        maxDate.setDate(today.getDate() + 90);
        bookingDate.min = today.toISOString().split('T')[0];
        bookingDate.max = maxDate.toISOString().split('T')[0];
    }

    if (bookingForm) {
        bookingForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const userId = localStorage.getItem('userId');
            if (!userId) {
                await openAlertModal('Yêu cầu đăng nhập', 'Vui lòng đăng nhập trước.');
                return;
            }
            const payload = {
                user_id: Number(userId),
                cafe_id: cafeId ? Number(cafeId) : null,
                booking_date: bookingDate?.value,
                booking_time: bookingTime?.value,
                number_of_people: bookingPeople?.value,
                note: bookingNote?.value || ''
            };
            const selectedFeatures = Array.from(document.querySelectorAll('.feature-checkboxes input:checked'))
                .map((input) => input.value);
            if (selectedFeatures.length > 0) {
                payload.note = `${payload.note}\nYeu cau: ${selectedFeatures.join(', ')}`.trim();
            }
            const response = await apiClient.post('/bookings', payload);
            if (response.success) {
                await openAlertModal('Thành công', 'Đã gửi yêu cầu đặt chỗ thành công');
                bookingForm.reset();
            } else {
                await openAlertModal('Lỗi', response.error || 'Không thể gửi yêu cầu đặt chỗ.');
            }
        });
    }
}

async function initSettingsPage() {
    const panel = document.getElementById('settingsPanel');
    const token = localStorage.getItem('token');
    const language = localStorage.getItem('language') || 'vi';
    const userId = localStorage.getItem('userId');

    if (!panel) return;

    const labels = {
        vi: {
            username: 'Tên người dùng',
            email: 'Email',
            phone: 'Số điện thoại',
            avatar: 'Ảnh đại diện',
            role: 'Vai trò',
            language: 'Ngôn ngữ',
            theme: 'Giao diện',
            notifications: 'Thông báo',
            logout: 'Đăng xuất',
            save: 'Lưu thay đổi',
            login: 'Đăng nhập',
            edit: 'Chỉnh sửa',
            light: 'Sáng',
            dark: 'Tối',
            vietnamese: 'Tiếng Việt',
            japanese: 'Tiếng Nhật'
        },
        jp: {
            username: 'ユーザー名',
            email: 'メール',
            phone: '電話番号',
            avatar: 'プロフィール画像',
            role: 'ロール',
            language: '言語',
            theme: '表示設定',
            notifications: '通知',
            logout: 'ログアウト',
            save: '保存',
            login: 'ログイン',
            edit: '編集',
            light: '明',
            dark: '暗',
            vietnamese: 'ベトナム語',
            japanese: '日本語'
        }
    };

    const text = labels[language] || labels.vi;

    if (!token) {
        panel.innerHTML = `
            <button class="settings-login-btn" id="loginBtn">${text.login}</button>
            <div class="settings-row-line">
                <span class="settings-label">${text.language}</span>
                <select id="settingsLanguage" class="settings-select">
                    <option value="vi">${text.vietnamese}</option>
                    <option value="jp">${text.japanese}</option>
                </select>
            </div>
            <div class="settings-row-line">
                <span class="settings-label">${text.theme}</span>
                <select id="settingsTheme" class="settings-select">
                    <option value="light">${text.light}</option>
                    <option value="dark">${text.dark}</option>
                </select>
            </div>
            <div class="settings-row-line">
                <span class="settings-label">${text.notifications}</span>
                <label class="toggle-switch">
                    <input type="checkbox" id="toggleNotifications" checked>
                    <span class="toggle-slider"></span>
                </label>
            </div>
        `;

        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                window.location.href = 'signin.html';
            });
        }

        const settingsLanguage = document.getElementById('settingsLanguage');
        if (settingsLanguage) {
            settingsLanguage.value = language;
            settingsLanguage.addEventListener('change', () => {
                localStorage.setItem('language', settingsLanguage.value);
                initSettingsPage();
                applyLanguage();
            });
        }

        const settingsTheme = document.getElementById('settingsTheme');
        if (settingsTheme) {
            settingsTheme.value = localStorage.getItem('theme') || 'light';
            settingsTheme.addEventListener('change', () => {
                localStorage.setItem('theme', settingsTheme.value);
                applyTheme();
            });
        }

        return;
    }
    let account = null;
    if (userId) {
        const accountResponse = await apiClient.get(`/accounts/${userId}`);
        account = accountResponse.success ? accountResponse.data : null;
    }
    const username = account?.username || localStorage.getItem('username') || 'User';
    const email = account?.email || '';
    const phone = account?.phone || '';
    const avatarUrl = account?.avatar_url || '';
    const role = account?.role || localStorage.getItem('userRole') || 'user';

    const avatarMarkup = avatarUrl
        ? `<img src="${avatarUrl}" alt="Avatar" id="settingsAvatarPreview">`
        : '<i class="fa-regular fa-circle-user"></i>';

    panel.innerHTML = `
        <div class="settings-top">
            <div class="settings-avatar-circle">${avatarMarkup}</div>
            <div class="settings-profile-info">
                <span class="settings-label">${text.username}</span>
                <input type="text" class="settings-input" value="${username}" id="settingsUsername">
            </div>
            <button class="settings-edit-btn" id="settingsEditBtn" title="${text.save}">
                <i class="fa-solid fa-pen"></i>
            </button>
        </div>
        <div class="settings-row-line">
            <span class="settings-label">${text.email}</span>
            <input type="email" class="settings-input" value="${email}" id="settingsEmail">
        </div>
        <div class="settings-row-line">
            <span class="settings-label">${text.phone}</span>
            <input type="text" class="settings-input" value="${phone}" id="settingsPhone">
        </div>
        <input type="hidden" value="${avatarUrl}" id="settingsAvatar">
        <button class="settings-logout-btn" id="logoutBtn">${text.logout}</button>
        <div class="settings-row-line">
            <span class="settings-label">${text.language}</span>
            <select id="settingsLanguage" class="settings-select">
                <option value="vi">${text.vietnamese}</option>
                <option value="jp">${text.japanese}</option>
            </select>
        </div>
        <div class="settings-row-line">
            <span class="settings-label">${text.theme}</span>
            <select id="settingsTheme" class="settings-select">
                <option value="light">${text.light}</option>
                <option value="dark">${text.dark}</option>
            </select>
        </div>
        <div class="settings-row-line">
            <span class="settings-label">${text.notifications}</span>
            <label class="toggle-switch">
                <input type="checkbox" id="toggleNotifications" checked>
                <span class="toggle-slider"></span>
            </label>
        </div>
    `;

    const settingsLanguage = document.getElementById('settingsLanguage');
    if (settingsLanguage) {
        settingsLanguage.value = language;
        settingsLanguage.addEventListener('change', () => {
            localStorage.setItem('language', settingsLanguage.value);
            initSettingsPage();
            applyLanguage();
        });
    }

    const settingsTheme = document.getElementById('settingsTheme');
    if (settingsTheme) {
        settingsTheme.value = localStorage.getItem('theme') || 'light';
        settingsTheme.addEventListener('change', () => {
            localStorage.setItem('theme', settingsTheme.value);
            applyTheme();
        });
    }

    const saveProfile = async () => {
        if (!userId) return;
        const settingsUsername = document.getElementById('settingsUsername');
        const settingsEmail = document.getElementById('settingsEmail');
        const settingsPhone = document.getElementById('settingsPhone');
        const settingsAvatarValue = document.getElementById('settingsAvatar');

        const payload = {
            username: settingsUsername?.value.trim() || null,
            email: settingsEmail?.value.trim() || null,
            phone: settingsPhone?.value.trim() || null,
            avatar_url: settingsAvatarValue?.value.trim() || null
        };

        const response = await apiClient.put(`/accounts/${userId}`, payload);
        if (response.success) {
            const updated = Array.isArray(response.data) ? response.data[0] : response.data;
            if (updated?.username) {
                localStorage.setItem('username', updated.username);
            }
            await openAlertModal('Thành công', 'Đã lưu thông tin cá nhân.');
        } else {
            await openAlertModal('Lỗi', response.error || 'Không thể cập nhật tài khoản.');
        }
    };

    const editBtn = document.getElementById('settingsEditBtn');
    if (editBtn) {
        editBtn.addEventListener('click', saveProfile);
    }



    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = 'index.html';
        });
    }
}
