# GolfCartly 🚗

**The Ultimate Golf Cart Resource Platform**

Professional GPS navigation, comprehensive technical database, wiring diagrams, and parts catalog - all optimized for LSV, NEV, and street-legal golf cart owners.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-production%20ready-brightgreen.svg)

---

## 🎯 Overview

GolfCartly is the world's most comprehensive platform for golf cart owners, technicians, and enthusiasts. Built from the ground up to solve real problems:

- **No golf cart-specific GPS navigation exists** - Routes go through backyards and highways
- **Wiring diagrams are scattered and hard to find** - We're building the largest centralized database
- **Technical specs are incomplete** - We aggregate everything in one place

### Key Features

✅ **GPS Navigation** - Routes filtered for ≤35 mph roads, residential streets, and bike paths
✅ **Wiring Diagram Database** - Upload, find, or create custom AutoCAD diagrams
✅ **Comprehensive Specs** - Complete database of all golf cart brands and models
✅ **Parts Catalog** - Search and order parts with compatibility checking
✅ **Binary Storage** - PostgreSQL-based diagram storage for reliability

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **PostgreSQL** database (local or hosted on Neon)
- **Google Maps API Key** with Maps, Directions, Geocoding, and Places APIs enabled

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/golfcartly.git
cd golfcartly

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database URL and Google Maps API key

# Push database schema
npm run db:push

# Start development server
npm run dev
```

The app will be available at `http://localhost:5000`

---

## 🗄️ Database Setup

### Using Neon (Recommended)

1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string to `.env` as `DATABASE_URL`
4. Run migrations: `npm run db:push`

### Using Local PostgreSQL

```bash
# Create database
createdb golfcartly

# Set DATABASE_URL in .env
DATABASE_URL="postgresql://localhost:5432/golfcartly"

# Run migrations
npm run db:push
```

---

## 🔑 Google Maps API Setup

### Required APIs

Enable these in [Google Cloud Console](https://console.cloud.google.com):

- Maps JavaScript API
- Directions API
- Geocoding API
- Places API

### Configuration

```bash
# In .env file
VITE_GOOGLE_MAPS_API_KEY="your-api-key-here"
```

**Important:** For production, restrict your API key:
- HTTP referrers: `yourdomain.com/*`
- API restrictions: Only the 4 APIs listed above

---

## 🏗️ Technology Stack

### Frontend
- **React 18** + TypeScript
- **Vite** for blazing-fast builds
- **Tailwind CSS** + shadcn/ui for beautiful UI
- **TanStack Query** for server state
- **Wouter** for lightweight routing
- **Google Maps API** for navigation
- **Leaflet** for alternative mapping

### Backend
- **Node.js** + Express
- **TypeScript** for type safety
- **Drizzle ORM** for database queries
- **PostgreSQL** for data storage
- **Multer** for file uploads

---

## 📁 Project Structure

```
golfcartly/
├── client/               # React frontend
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   ├── lib/         # Utilities and helpers
│   │   └── App.tsx      # Main app component
│   └── index.html       # HTML template
│
├── server/              # Express backend
│   ├── index.ts         # Server entry point
│   ├── routes.ts        # API routes
│   └── storage.ts       # Database operations
│
├── shared/              # Shared code
│   └── schema.ts        # Database schema (Drizzle)
│
└── db/                  # Database migrations
    └── migrations/
```

---

## 🗺️ GPS Navigation Features

### Golf Cart Optimized Routing

The navigation system is specifically designed for golf carts:

```typescript
// Automatic route filtering
- Avoids highways ✓
- Avoids toll roads ✓
- Filters for ≤35 mph roads ✓
- Prefers residential streets ✓
- Includes bike paths ✓
```

### Real-time Tracking

- GPS location monitoring
- Turn-by-turn directions
- Waypoint advancement
- Distance and ETA calculations
- Export to Google Maps for mobile

---

## 📸 Wiring Diagram Management

### Upload System

```typescript
// Supports multiple formats
- Images (PNG, JPEG, GIF)
- PDFs
- AutoCAD drawings (DWG via image export)

// Binary storage in PostgreSQL
- Stores as base64 in database
- No external file storage needed
- Reliable and portable
```

### Custom Diagrams

Can't find a diagram? Upload your own or mark it as a custom AutoCAD drawing to share with the community.

---

## 🔧 API Endpoints

### Golf Carts
```
GET  /api/brands              # List all brands
GET  /api/brands/:id          # Get brand details
GET  /api/models              # List all models
GET  /api/models/:id          # Get model details
```

### Wiring Diagrams
```
GET  /api/wiring-diagrams     # List all diagrams
POST /api/wiring-diagrams     # Upload diagram (multipart/form-data)
GET  /api/wiring-diagrams/:id # Get diagram details
GET  /api/wiring-diagrams/:id/image  # Get binary image
```

### GPS Navigation
```
GET  /api/gps/routes          # List routes
POST /api/gps/routes          # Create route
POST /api/gps/navigation/start  # Start navigation session
PUT  /api/gps/navigation/:id  # Update session
POST /api/gps/tracking        # Add tracking point
```

### Parts
```
GET  /api/parts               # List parts
GET  /api/parts/:id           # Get part details
```

### Shopping Cart
```
GET  /api/cart                # Get cart items
POST /api/cart                # Add item
PUT  /api/cart/:id            # Update quantity
DELETE /api/cart/:id          # Remove item
```

---

## 🎨 UI Components

Built with **shadcn/ui** for a modern, accessible interface:

- Beautiful cards with hover effects
- Responsive grid layouts
- Loading states and error handling
- Form validation
- Badge and tag systems
- Modal dialogs

---

## 🚢 Deployment

### Production Build

```bash
# Build the application
npm run build

# Preview production build
npm run preview
```

### Environment Variables (Production)

```bash
NODE_ENV=production
DATABASE_URL="your-production-database-url"
VITE_GOOGLE_MAPS_API_KEY="your-restricted-api-key"
SESSION_SECRET="secure-random-string"
PORT=5000
```

### Deploy to Vercel/Railway/Render

The app is production-ready and works with any Node.js hosting platform.

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- Golf cart community for inspiration
- Google Maps Platform for navigation APIs
- shadcn for the beautiful UI components
- Drizzle team for the excellent ORM

---

## 🗺️ Roadmap

### Coming Soon

- [ ] User authentication
- [ ] Save favorite routes
- [ ] Route sharing
- [ ] Mobile app (React Native)
- [ ] Offline map support
- [ ] Payment integration for parts
- [ ] Community forums
- [ ] Maintenance tracking
- [ ] Fleet management

---

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/yourusername/golfcartly/issues)
- **Email:** support@golfcartly.com
- **Website:** [golfcartly.com](https://golfcartly.com)

---

**Built with ❤️ for the golf cart community**

*Navigate smarter. Maintain better. Drive confidently.*
