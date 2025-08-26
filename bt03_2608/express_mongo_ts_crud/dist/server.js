"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = __importDefault(require("./config/database"));
const web_1 = __importDefault(require("./routes/web"));
// Load environment variables
dotenv_1.default.config();
class Server {
    constructor() {
        this.app = (0, express_1.default)();
        this.port = parseInt(process.env.PORT || '3000');
        this.configureMiddleware();
        this.configureRoutes();
        this.connectDatabase();
    }
    configureMiddleware() {
        // CORS
        this.app.use((0, cors_1.default)());
        // Body parser
        this.app.use(body_parser_1.default.json());
        this.app.use(body_parser_1.default.urlencoded({ extended: true }));
        // View engine setup
        this.app.set('view engine', 'ejs');
        this.app.set('views', path_1.default.join(__dirname, 'views'));
        // Static files
        this.app.use('/static', express_1.default.static(path_1.default.join(__dirname, 'public')));
        // Logging middleware
        this.app.use((req, res, next) => {
            console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
            next();
        });
    }
    configureRoutes() {
        this.app.use('/', web_1.default);
        // 404 handler
        this.app.use('*', (req, res) => {
            res.status(404).send('Page not found');
        });
    }
    async connectDatabase() {
        await (0, database_1.default)();
    }
    start() {
        this.app.listen(this.port, () => {
            console.log(`🚀 Server is running on port ${this.port}`);
            console.log(`📱 Access the app at: http://localhost:${this.port}`);
        });
    }
}
// Start the server
const server = new Server();
server.start();
//# sourceMappingURL=server.js.map