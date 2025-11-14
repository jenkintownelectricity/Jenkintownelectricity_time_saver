import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { eq, like, or, and, sql } from 'drizzle-orm';
import * as schema from '../shared/schema';

// Initialize database connection
const connectionString = process.env.DATABASE_URL!;
const client = neon(connectionString);
export const db = drizzle(client, { schema });

// Storage interface for all database operations
export const storage = {
  // Brands
  async getBrands() {
    return db.select().from(schema.golfCartBrands);
  },

  async getBrand(id: number) {
    const [brand] = await db.select().from(schema.golfCartBrands).where(eq(schema.golfCartBrands.id, id));
    return brand;
  },

  async createBrand(data: schema.InsertBrand) {
    const [brand] = await db.insert(schema.golfCartBrands).values(data).returning();
    return brand;
  },

  // Models
  async getModels(filters?: { brandId?: number; vehicleType?: string }) {
    let query = db.select().from(schema.golfCartModels);

    if (filters?.brandId) {
      query = query.where(eq(schema.golfCartModels.brandId, filters.brandId)) as any;
    }

    return query;
  },

  async getModel(id: number) {
    const [model] = await db.select().from(schema.golfCartModels).where(eq(schema.golfCartModels.id, id));
    return model;
  },

  async createModel(data: schema.InsertModel) {
    const [model] = await db.insert(schema.golfCartModels).values(data).returning();
    return model;
  },

  // Wiring Diagrams
  async getWiringDiagrams(filters?: { brandId?: number; modelId?: number }) {
    let query = db.select().from(schema.wiringDiagrams);

    const conditions = [];
    if (filters?.brandId) {
      conditions.push(eq(schema.wiringDiagrams.brandId, filters.brandId));
    }
    if (filters?.modelId) {
      conditions.push(eq(schema.wiringDiagrams.modelId, filters.modelId));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    return query;
  },

  async getWiringDiagram(id: number) {
    const [diagram] = await db.select().from(schema.wiringDiagrams).where(eq(schema.wiringDiagrams.id, id));
    return diagram;
  },

  async createWiringDiagram(data: schema.InsertWiringDiagram) {
    const [diagram] = await db.insert(schema.wiringDiagrams).values(data).returning();
    return diagram;
  },

  // Parts
  async getParts(filters?: { category?: string; brandId?: string }) {
    let query = db.select().from(schema.parts);

    if (filters?.category) {
      query = query.where(eq(schema.parts.category, filters.category)) as any;
    }

    return query;
  },

  async getPart(id: number) {
    const [part] = await db.select().from(schema.parts).where(eq(schema.parts.id, id));
    return part;
  },

  async createPart(data: schema.InsertPart) {
    const [part] = await db.insert(schema.parts).values(data).returning();
    return part;
  },

  // Suppliers
  async getSuppliers() {
    return db.select().from(schema.suppliers);
  },

  async getSupplier(id: number) {
    const [supplier] = await db.select().from(schema.suppliers).where(eq(schema.suppliers.id, id));
    return supplier;
  },

  async createSupplier(data: schema.InsertSupplier) {
    const [supplier] = await db.insert(schema.suppliers).values(data).returning();
    return supplier;
  },

  // Shopping Cart
  async getCartItems(sessionId: string) {
    return db.select()
      .from(schema.cartItems)
      .where(eq(schema.cartItems.sessionId, sessionId));
  },

  async addCartItem(data: schema.InsertCartItem) {
    const [item] = await db.insert(schema.cartItems).values(data).returning();
    return item;
  },

  async updateCartItem(id: number, quantity: number) {
    const [item] = await db.update(schema.cartItems)
      .set({ quantity })
      .where(eq(schema.cartItems.id, id))
      .returning();
    return item;
  },

  async removeCartItem(id: number) {
    await db.delete(schema.cartItems).where(eq(schema.cartItems.id, id));
  },

  async clearCart(sessionId: string) {
    await db.delete(schema.cartItems).where(eq(schema.cartItems.sessionId, sessionId));
  },

  // GPS Routes
  async getRoutes(filters?: { vehicleType?: string; maxSpeedLimit?: number }) {
    let query = db.select().from(schema.gpsRoutes);

    const conditions = [];
    if (filters?.vehicleType) {
      conditions.push(sql`${filters.vehicleType} = ANY(${schema.gpsRoutes.vehicleTypes})`);
    }
    if (filters?.maxSpeedLimit) {
      conditions.push(sql`${schema.gpsRoutes.maxSpeedLimit} <= ${filters.maxSpeedLimit}`);
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    return query;
  },

  async getRoute(id: number) {
    const [route] = await db.select().from(schema.gpsRoutes).where(eq(schema.gpsRoutes.id, id));
    return route;
  },

  async createRoute(data: schema.InsertRoute) {
    const [route] = await db.insert(schema.gpsRoutes).values(data).returning();
    return route;
  },

  // Navigation Sessions
  async createNavigationSession(data: schema.InsertNavigationSession) {
    const [session] = await db.insert(schema.navigationSessions).values(data).returning();
    return session;
  },

  async getNavigationSession(sessionId: string) {
    const [session] = await db.select()
      .from(schema.navigationSessions)
      .where(eq(schema.navigationSessions.sessionId, sessionId));
    return session;
  },

  async updateNavigationSession(sessionId: string, data: Partial<schema.InsertNavigationSession>) {
    const [session] = await db.update(schema.navigationSessions)
      .set(data)
      .where(eq(schema.navigationSessions.sessionId, sessionId))
      .returning();
    return session;
  },

  // Tracking Points
  async addTrackingPoint(data: schema.InsertTrackingPoint) {
    const [point] = await db.insert(schema.trackingPoints).values(data).returning();
    return point;
  },

  async getTrackingPoints(sessionId: string) {
    return db.select()
      .from(schema.trackingPoints)
      .where(eq(schema.trackingPoints.sessionId, sessionId))
      .orderBy(schema.trackingPoints.timestamp);
  },

  // Search functionality
  async search(query: string) {
    const searchPattern = `%${query}%`;

    const [brands, models, parts, suppliers] = await Promise.all([
      db.select().from(schema.golfCartBrands)
        .where(or(
          like(schema.golfCartBrands.name, searchPattern),
          like(schema.golfCartBrands.description, searchPattern)
        )),
      db.select().from(schema.golfCartModels)
        .where(or(
          like(schema.golfCartModels.modelName, searchPattern),
          like(schema.golfCartModels.vehicleType, searchPattern)
        )),
      db.select().from(schema.parts)
        .where(or(
          like(schema.parts.name, searchPattern),
          like(schema.parts.partNumber, searchPattern),
          like(schema.parts.description, searchPattern)
        )),
      db.select().from(schema.suppliers)
        .where(like(schema.suppliers.name, searchPattern)),
    ]);

    return { brands, models, parts, suppliers };
  },
};
