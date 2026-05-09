import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.DATABASE_URL;
const supabaseKey = process.env.DATABASE_KEY;

if (!supabaseUrl || !supabaseKey || supabaseKey === "your_supabase_anon_key_here") {
    console.warn("⚠️ Cảnh báo: Vui lòng thay thế 'your_supabase_anon_key_here' bằng anon key thật của bạn trong file .env!");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Hàm kiểm tra kết nối khi khởi động server
export const testConnection = async () => {
    try {
        // Query thử một bảng (ví dụ: 'cafes') để xem kết nối có ổn không
        const { data, error } = await supabase.from('cafes').select('id').limit(1);
        if (error) {
            console.error("❌ Lỗi kết nối Supabase:", error.message);
        } else {
            console.log("✅ Kết nối đến Database Supabase thành công!");
        }
    } catch (err) {
        console.error("❌ Không thể kết nối Supabase:", err.message);
    }
};