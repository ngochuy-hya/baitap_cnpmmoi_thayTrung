import express, { Application } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import connectDB from './config/database';
import webRoutes from './routes/web';

// Load environment variables
dotenv.config();

class Server {
  private app: Application;
  private port: number;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '3000');
    this.configureMiddleware();
    this.configureRoutes();
    this.connectDatabase();
  }

  private configureMiddleware(): void {
    // CORS
    this.app.use(cors());

    // Body parser
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));

    // View engine setup
    this.app.set('view engine', 'ejs');
    this.app.set('views', path.join(__dirname, 'views'));

    // Static files
    this.app.use('/static', express.static(path.join(__dirname, 'public')));

    // Logging middleware
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
      next();
    });
  }

  private configureRoutes(): void {
    this.app.use('/', webRoutes);

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).send('Page not found');
    });
  }

  private async connectDatabase(): Promise<void> {
    await connectDB();
  }

  public start(): void {
    this.app.listen(this.port, () => {
      console.log(`🚀 Server is running on port ${this.port}`);
      console.log(`📱 Access the app at: http://localhost:${this.port}`);
    });
  }
}

// Start the server
const server = new Server();
server.start();