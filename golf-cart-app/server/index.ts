import express from 'express';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { neon } from '@neondatabase/serverless';
import { registerRoutes } from './routes';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;

// PostgreSQL session store
const PgSession = connectPgSimple(session);
const pgPool = neon(process.env.DATABASE_URL!);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(
  session({
    store: new PgSession({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-this',
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      secure: process.env.NODE_ENV === 'production',
    },
  })
);

// Register API routes
registerRoutes(app);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const clientDistPath = path.join(__dirname, '../../dist/client');
  app.use(express.static(clientDistPath));

  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  // In development, Vite dev server handles the frontend
  console.log('Running in development mode - Vite will handle frontend');
}

app.listen(port, () => {
  console.log(`🚗 GolfCartly server running on port ${port}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗺️  API available at http://localhost:${port}/api`);
});
