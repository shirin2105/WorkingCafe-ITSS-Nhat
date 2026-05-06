import { createClient } from "@supabase/supabase-js";
import env from "dotenv";

env.config();

export const supabase = createClient(
  process.env.DATABASE_URL,
  process.env.DATABASE_KEY
);