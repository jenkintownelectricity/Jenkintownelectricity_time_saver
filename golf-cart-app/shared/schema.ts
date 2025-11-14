import { pgTable, serial, text, integer, numeric, boolean, timestamp, jsonb, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Golf Cart Brands
export const golfCartBrands = pgTable('golf_cart_brands', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),
  specialization: text('specialization'),
  keyFeatures: text('key_features').array(),
  websiteUrl: text('website_url'),
  marketPosition: text('market_position'),
  logoUrl: text('logo_url'),
});

export const insertBrandSchema = createInsertSchema(golfCartBrands);
export type Brand = typeof golfCartBrands.$inferSelect;
export type InsertBrand = z.infer<typeof insertBrandSchema>;

// Golf Cart Models
export const golfCartModels = pgTable('golf_cart_models', {
  id: serial('id').primaryKey(),
  brandId: integer('brand_id').references(() => golfCartBrands.id).notNull(),
  modelName: text('model_name').notNull(),
  year: integer('year'),
  vehicleType: text('vehicle_type'), // LSV, NEV, Street Legal
  batteryType: text('battery_type'),
  voltage: text('voltage'),
  range: text('range'),
  topSpeed: text('top_speed'),
  seatingCapacity: integer('seating_capacity'),
  price: text('price'),
  features: text('features').array(),
  imageUrl: text('image_url'),
});

export const insertModelSchema = createInsertSchema(golfCartModels);
export type Model = typeof golfCartModels.$inferSelect;
export type InsertModel = z.infer<typeof insertModelSchema>;

// Wiring Diagrams with Binary Storage
export const wiringDiagrams = pgTable('wiring_diagrams', {
  id: serial('id').primaryKey(),
  modelId: integer('model_id').references(() => golfCartModels.id),
  brandId: integer('brand_id').references(() => golfCartBrands.id),
  title: text('title').notNull(),
  description: text('description'),
  year: integer('year'),
  // Binary data stored directly in PostgreSQL
  imageData: text('image_data'), // Base64 encoded binary data
  fileName: text('file_name'),
  fileType: text('file_type'), // image/png, image/jpeg, application/pdf
  fileSize: integer('file_size'), // in bytes
  uploadedAt: timestamp('uploaded_at').defaultNow(),
  // Alternative: URL if stored externally
  imageUrl: text('image_url'),
  isCustomDrawing: boolean('is_custom_drawing').default(false), // true if created in AutoCAD
  tags: text('tags').array(), // searchable tags
});

export const insertWiringDiagramSchema = createInsertSchema(wiringDiagrams);
export type WiringDiagram = typeof wiringDiagrams.$inferSelect;
export type InsertWiringDiagram = z.infer<typeof insertWiringDiagramSchema>;

// Parts Catalog
export const parts = pgTable('parts', {
  id: serial('id').primaryKey(),
  partNumber: text('part_number').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  category: text('category').notNull(), // Batteries, Tires, Controllers, Motors, etc.
  price: numeric('price', { precision: 10, scale: 2 }),
  supplierId: integer('supplier_id').references(() => suppliers.id),
  compatibleBrands: text('compatible_brands').array(),
  compatibleModels: text('compatible_models').array(),
  inStock: boolean('in_stock').default(true),
  imageUrl: text('image_url'),
  specifications: jsonb('specifications'), // Flexible JSON for various specs
});

export const insertPartSchema = createInsertSchema(parts);
export type Part = typeof parts.$inferSelect;
export type InsertPart = z.infer<typeof insertPartSchema>;

// Suppliers
export const suppliers = pgTable('suppliers', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  contactEmail: text('contact_email'),
  phone: text('phone'),
  website: text('website'),
  location: text('location'),
  specialization: text('specialization'),
});

export const insertSupplierSchema = createInsertSchema(suppliers);
export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;

// Shopping Cart Items
export const cartItems = pgTable('cart_items', {
  id: serial('id').primaryKey(),
  sessionId: text('session_id').notNull(),
  partId: integer('part_id').references(() => parts.id).notNull(),
  quantity: integer('quantity').notNull().default(1),
  addedAt: timestamp('added_at').defaultNow(),
});

export const insertCartItemSchema = createInsertSchema(cartItems);
export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;

// GPS Routes with enhanced metadata
export const gpsRoutes = pgTable('gps_routes', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  startLat: numeric('start_lat', { precision: 10, scale: 7 }).notNull(),
  startLng: numeric('start_lng', { precision: 10, scale: 7 }).notNull(),
  endLat: numeric('end_lat', { precision: 10, scale: 7 }).notNull(),
  endLng: numeric('end_lng', { precision: 10, scale: 7 }).notNull(),
  startAddress: text('start_address'),
  endAddress: text('end_address'),
  distance: numeric('distance', { precision: 10, scale: 2 }), // in miles
  estimatedTime: integer('estimated_time'), // in minutes
  difficulty: text('difficulty'), // Easy, Moderate, Challenging
  vehicleTypes: text('vehicle_types').array(), // LSV, NEV, Street Legal
  waypoints: jsonb('waypoints'), // Array of lat/lng coordinates
  roadTypes: text('road_types').array(), // residential, bike_path, low_speed, etc.
  maxSpeedLimit: integer('max_speed_limit').default(35), // mph
  safetyRequirements: jsonb('safety_requirements'),
  restrictions: jsonb('restrictions'),
  amenities: text('amenities').array(),
  trafficLevel: text('traffic_level'), // Low, Medium, High
  scenicRating: integer('scenic_rating'), // 1-5
  isVerified: boolean('is_verified').default(false), // Admin verified route
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const insertRouteSchema = createInsertSchema(gpsRoutes);
export type Route = typeof gpsRoutes.$inferSelect;
export type InsertRoute = z.infer<typeof insertRouteSchema>;

// Navigation Sessions
export const navigationSessions = pgTable('navigation_sessions', {
  id: serial('id').primaryKey(),
  routeId: integer('route_id').references(() => gpsRoutes.id),
  sessionId: varchar('session_id', { length: 255 }).notNull().unique(),
  vehicleType: text('vehicle_type').notNull(),
  status: text('status').notNull().default('active'), // active, completed, cancelled
  currentLat: numeric('current_lat', { precision: 10, scale: 7 }),
  currentLng: numeric('current_lng', { precision: 10, scale: 7 }),
  currentWaypointIndex: integer('current_waypoint_index').default(0),
  startTime: timestamp('start_time').notNull().defaultNow(),
  endTime: timestamp('end_time'),
  totalDistance: numeric('total_distance', { precision: 10, scale: 2 }),
  avgSpeed: numeric('avg_speed', { precision: 10, scale: 2 }),
});

export const insertNavigationSessionSchema = createInsertSchema(navigationSessions);
export type NavigationSession = typeof navigationSessions.$inferSelect;
export type InsertNavigationSession = z.infer<typeof insertNavigationSessionSchema>;

// GPS Tracking Points
export const trackingPoints = pgTable('tracking_points', {
  id: serial('id').primaryKey(),
  sessionId: varchar('session_id', { length: 255 }).notNull(),
  lat: numeric('lat', { precision: 10, scale: 7 }).notNull(),
  lng: numeric('lng', { precision: 10, scale: 7 }).notNull(),
  speed: numeric('speed', { precision: 10, scale: 2 }), // mph
  heading: numeric('heading', { precision: 10, scale: 2 }), // degrees
  accuracy: numeric('accuracy', { precision: 10, scale: 2 }), // meters
  roadType: text('road_type'), // detected road type
  timestamp: timestamp('timestamp').defaultNow(),
});

export const insertTrackingPointSchema = createInsertSchema(trackingPoints);
export type TrackingPoint = typeof trackingPoints.$inferSelect;
export type InsertTrackingPoint = z.infer<typeof insertTrackingPointSchema>;
