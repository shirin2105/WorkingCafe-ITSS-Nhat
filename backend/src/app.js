import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import routes from './routes/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

const apiResponseWrapper = (req, res, next) => {
    const originalJson = res.json.bind(res);
    res.json = (payload) => {
        const isError = res.statusCode >= 400;
        if (isError) {
            const message = payload?.message || payload?.error || 'Lỗi hệ thống';
            return originalJson({
                success: false,
                error: message,
                details: payload
            });
        }
        return originalJson({ success: true, data: payload });
    };
    next();
};

// Serve static frontend files from project root
app.use(express.static(path.join(__dirname, '../../')));

app.get('/', (_, res) => 
    res.json({ info: "Welcome to WorkingCafe" })
);

app.use('/api', apiResponseWrapper, routes);

export default app;