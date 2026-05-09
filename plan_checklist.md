# Working Cafe - Build Plan and Checklist

Last updated: 2026-05-07

## Core Principles

- Always validate features against the specification before implementation.
- Always validate DB fields, enums, and relationships against [database_structure.md](database_structure.md).
- FE should match UI_template images as closely as possible (layout, spacing, typography, colors).

## Reference Inputs

- Spec details: [excel_output.txt](excel_output.txt)
- DB schema snapshot: [database_structure.md](database_structure.md)
- UI templates: [UI_template/](UI_template/)

## Master Plan (Phased)

### Phase 0 - Baseline and Alignment

- [x] Confirm all required screens from spec exist as HTML files or are planned.
- [x] Map each UI_template image to its screen ID in spec.
- [x] Map spec screen flows to actual routes/links in FE.
- [x] Verify API base URL and environment configuration.

UI_template mapping (spec screen ID -> HTML -> UI template):
- 1 Home -> index.html -> UI_template/dashboard.png
- 2 Search -> search.html -> UI_template/find_and_filter_food.png
- 3 Map -> cafe-map.html -> UI_template/mappage.png
- 4 Cafe detail -> cafe-detail.html -> UI_template/cafe_restaurant_info_page.png
- 5 Menu -> menu.html -> UI_template/menu_page.png
- 6 Reviews -> reviews.html -> UI_template/rating_page.png
- 7 Login -> signin.html -> UI_template/setting_page_for_non_login.png
- 8 Signup -> signup.html -> UI_template/setting_page_for_non_login.png
- 9 Booking -> booking.html -> UI_template/preorder_seat_page.png
- 10 Settings -> settings.html -> UI_template/setting_page_for_logined.png

### Phase 1 - Data Model and API Coverage

- [x] Verify tables used by the app: accounts, cafes, features, cafe_features, menu_items, reviews, menu_reviews, bookings, favorites, notifications.
- [x] Confirm enum usage: user_role, booking_status.
- [x] Confirm FK relationships match API payloads.
- [x] Create/verify API endpoints for each module:
  - [x] Accounts
  - [x] Auth
  - [x] Cafes
  - [x] Features
  - [x] Cafe features
  - [x] Menu items
  - [x] Menu reviews
  - [x] Reviews
  - [x] Bookings
  - [x] Favorites
  - [x] Notifications
- [x] Standardize response shape and error handling.

### Phase 2 - Screen-by-Screen FE Implementation

> Implement each screen according to the spec. Match UI_template image for each screen.

- [x] Home screen
  - [x] Header logo, search, settings/profile/notification state by auth
  - [x] Recommended cafes list with image + name
  - [x] Link to details
- [x] Search and filter screen
  - [x] Keyword search
  - [x] Location filter (multi-select)
  - [x] Feature filter (multi-select)
  - [x] Time filter (single select)
  - [x] Filter tags with remove
  - [x] Results list and pagination buttons
- [x] Map screen
  - [x] Cafe map markers
  - [x] Cafe info panel
  - [x] Edit button for owner only
- [x] Cafe detail screen
  - [x] Cafe hero image + more photos link
  - [x] Name, rating, address
  - [x] Criteria list (features)
  - [x] Best seller items
  - [x] Menu link
  - [x] Reviews preview + link
  - [x] Booking icon
  - [x] Owner edit controls
- [x] Menu screen
  - [x] Menu list (image, name, price, rating)
  - [x] Detail pane (name, desc, price)
  - [x] Rating control + submit
  - [x] Owner edit, add, delete controls
- [x] Reviews screen
  - [x] Rating distribution
  - [x] Average rating
  - [x] Review list
  - [x] Review input with submit
- [x] Booking screen
  - [x] Date picker (today to +90 days)
  - [x] Time dropdown (08:00-21:00, 30m)
  - [x] People count (1-10)
  - [x] Facilities multi-select
  - [x] Notes
  - [x] Submit with validation
- [x] Settings screen
  - [x] Language
  - [x] Theme
  - [x] Notification toggle
  - [x] Profile fields
  - [x] Logout
- [x] Login screen
  - [x] Identifier + password
  - [x] Link to signup
- [x] Signup screen
  - [x] Email/username, password, phone
  - [x] Role selector
  - [x] Owner fields (cafe name, address, open/close time)
  - [x] Submit

### Phase 3 - Business Logic and Validation

- [x] Validation rules follow spec (email, username, password, times).
- [x] Role-based UI and permissions.
- [x] Booking status flow: pending -> approved/cancelled.
- [x] Favorites toggle and persistence.
- [x] Notifications for bookings to owners.

### Phase 4 - Testing and QA

- [ ] Happy path flow: signup -> login -> create cafe (owner) -> add menu -> review -> booking.
- [ ] Edge cases: missing fields, invalid formats, unauthorized actions.
- [ ] UI parity check with UI_template images.

## Detailed Checklist by Module (DB-Aware)

### Auth

- [x] Register validates email/username/password per spec.
- [x] Register owner creates cafe with open_time/close_time.
- [x] Login supports email or username.
- [x] JWT stored and used in FE.

### Accounts

- [x] Profile fields match accounts schema: username, email, phone, avatar_url, role.
- [x] Update profile uses correct field names.

### Cafes

- [x] Create cafe uses: owner_id, name, address, city, open_time, close_time, image_url.
- [x] Update cafe supports owner-only changes.
- [x] List/search support filtering by keyword, location, features.

### Features and Cafe Features

- [x] Feature list uses features table.
- [x] Cafe features uses cafe_features junction table.

### Menu Items and Menu Reviews

- [x] Menu items list by cafe_id.
- [x] Menu reviews linked to menu_item_id and user_id.
- [x] Rating validation 1-5.

### Reviews

- [x] Reviews linked to cafe_id and user_id.
- [x] Rating validation 1-5.
- [x] Aggregate ratings for display.

### Bookings

- [x] booking_date, booking_time, number_of_people, note stored.
- [x] Status uses booking_status enum.
- [x] Owner can approve/cancel.

### Favorites

- [x] Toggle favorites by user_id and cafe_id.

### Notifications

- [x] Create notification on booking.
- [x] is_read toggle.

## Files to Update (Expected)

- backend/src/modules/*
- backend/src/utils/validators.js
- script.js, api.js
- HTML pages for screens
- style.css for UI parity

## Notes

- All screen implementations must be checked against [excel_output.txt](excel_output.txt) before coding.
- UI must closely match the corresponding [UI_template](UI_template/) image for each screen.
