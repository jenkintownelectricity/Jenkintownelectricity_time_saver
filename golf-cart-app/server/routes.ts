import type { Express, Request, Response } from 'express';
import { storage } from './storage';
import multer from 'multer';
import { z } from 'zod';

// Configure multer for file uploads (in-memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export function registerRoutes(app: Express) {
  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // ===== BRANDS =====
  app.get('/api/brands', async (req, res) => {
    try {
      const brands = await storage.getBrands();
      res.json(brands);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch brands' });
    }
  });

  app.get('/api/brands/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const brand = await storage.getBrand(id);
      if (!brand) {
        return res.status(404).json({ error: 'Brand not found' });
      }
      res.json(brand);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch brand' });
    }
  });

  app.post('/api/brands', async (req, res) => {
    try {
      const brand = await storage.createBrand(req.body);
      res.status(201).json(brand);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create brand' });
    }
  });

  // ===== MODELS =====
  app.get('/api/models', async (req, res) => {
    try {
      const filters = {
        brandId: req.query.brandId ? parseInt(req.query.brandId as string) : undefined,
        vehicleType: req.query.vehicleType as string | undefined,
      };
      const models = await storage.getModels(filters);
      res.json(models);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch models' });
    }
  });

  app.get('/api/models/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const model = await storage.getModel(id);
      if (!model) {
        return res.status(404).json({ error: 'Model not found' });
      }
      res.json(model);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch model' });
    }
  });

  app.post('/api/models', async (req, res) => {
    try {
      const model = await storage.createModel(req.body);
      res.status(201).json(model);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create model' });
    }
  });

  // ===== WIRING DIAGRAMS =====
  app.get('/api/wiring-diagrams', async (req, res) => {
    try {
      const filters = {
        brandId: req.query.brandId ? parseInt(req.query.brandId as string) : undefined,
        modelId: req.query.modelId ? parseInt(req.query.modelId as string) : undefined,
      };
      const diagrams = await storage.getWiringDiagrams(filters);
      res.json(diagrams);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch wiring diagrams' });
    }
  });

  app.get('/api/wiring-diagrams/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const diagram = await storage.getWiringDiagram(id);
      if (!diagram) {
        return res.status(404).json({ error: 'Wiring diagram not found' });
      }
      res.json(diagram);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch wiring diagram' });
    }
  });

  // Upload wiring diagram with binary storage
  app.post('/api/wiring-diagrams', upload.single('file'), async (req, res) => {
    try {
      const file = req.file;
      let imageData: string | undefined;

      if (file) {
        // Convert buffer to base64 for PostgreSQL storage
        imageData = file.buffer.toString('base64');
      }

      const data = {
        modelId: req.body.modelId ? parseInt(req.body.modelId) : null,
        brandId: req.body.brandId ? parseInt(req.body.brandId) : null,
        title: req.body.title,
        description: req.body.description || null,
        year: req.body.year ? parseInt(req.body.year) : null,
        imageData: imageData,
        fileName: file?.originalname || null,
        fileType: file?.mimetype || null,
        fileSize: file?.size || null,
        imageUrl: req.body.imageUrl || null,
        isCustomDrawing: req.body.isCustomDrawing === 'true',
        tags: req.body.tags ? JSON.parse(req.body.tags) : null,
      };

      const diagram = await storage.createWiringDiagram(data);
      res.status(201).json(diagram);
    } catch (error) {
      console.error('Error uploading wiring diagram:', error);
      res.status(500).json({ error: 'Failed to upload wiring diagram' });
    }
  });

  // Get wiring diagram image data
  app.get('/api/wiring-diagrams/:id/image', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const diagram = await storage.getWiringDiagram(id);

      if (!diagram) {
        return res.status(404).json({ error: 'Wiring diagram not found' });
      }

      if (!diagram.imageData) {
        return res.status(404).json({ error: 'No image data available' });
      }

      // Convert base64 back to buffer and send
      const buffer = Buffer.from(diagram.imageData, 'base64');
      res.set('Content-Type', diagram.fileType || 'image/png');
      res.send(buffer);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch image' });
    }
  });

  // ===== PARTS =====
  app.get('/api/parts', async (req, res) => {
    try {
      const filters = {
        category: req.query.category as string | undefined,
        brandId: req.query.brandId as string | undefined,
      };
      const parts = await storage.getParts(filters);
      res.json(parts);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch parts' });
    }
  });

  app.get('/api/parts/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const part = await storage.getPart(id);
      if (!part) {
        return res.status(404).json({ error: 'Part not found' });
      }
      res.json(part);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch part' });
    }
  });

  app.post('/api/parts', async (req, res) => {
    try {
      const part = await storage.createPart(req.body);
      res.status(201).json(part);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create part' });
    }
  });

  // ===== SUPPLIERS =====
  app.get('/api/suppliers', async (req, res) => {
    try {
      const suppliers = await storage.getSuppliers();
      res.json(suppliers);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch suppliers' });
    }
  });

  app.get('/api/suppliers/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const supplier = await storage.getSupplier(id);
      if (!supplier) {
        return res.status(404).json({ error: 'Supplier not found' });
      }
      res.json(supplier);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch supplier' });
    }
  });

  // ===== SHOPPING CART =====
  app.get('/api/cart', async (req, res) => {
    try {
      const sessionId = req.session.id;
      const items = await storage.getCartItems(sessionId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch cart items' });
    }
  });

  app.post('/api/cart', async (req, res) => {
    try {
      const sessionId = req.session.id;
      const item = await storage.addCartItem({
        sessionId,
        partId: req.body.partId,
        quantity: req.body.quantity || 1,
      });
      res.status(201).json(item);
    } catch (error) {
      res.status(500).json({ error: 'Failed to add item to cart' });
    }
  });

  app.put('/api/cart/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const item = await storage.updateCartItem(id, req.body.quantity);
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update cart item' });
    }
  });

  app.delete('/api/cart/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.removeCartItem(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to remove cart item' });
    }
  });

  app.delete('/api/cart', async (req, res) => {
    try {
      const sessionId = req.session.id;
      await storage.clearCart(sessionId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to clear cart' });
    }
  });

  // ===== GPS ROUTES =====
  app.get('/api/gps/routes', async (req, res) => {
    try {
      const filters = {
        vehicleType: req.query.vehicleType as string | undefined,
        maxSpeedLimit: req.query.maxSpeedLimit ? parseInt(req.query.maxSpeedLimit as string) : undefined,
      };
      const routes = await storage.getRoutes(filters);
      res.json(routes);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch routes' });
    }
  });

  app.get('/api/gps/routes/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const route = await storage.getRoute(id);
      if (!route) {
        return res.status(404).json({ error: 'Route not found' });
      }
      res.json(route);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch route' });
    }
  });

  app.post('/api/gps/routes', async (req, res) => {
    try {
      const route = await storage.createRoute(req.body);
      res.status(201).json(route);
    } catch (error) {
      console.error('Error creating route:', error);
      res.status(500).json({ error: 'Failed to create route' });
    }
  });

  // ===== NAVIGATION =====
  app.post('/api/gps/navigation/start', async (req, res) => {
    try {
      const session = await storage.createNavigationSession(req.body);
      res.status(201).json(session);
    } catch (error) {
      res.status(500).json({ error: 'Failed to start navigation session' });
    }
  });

  app.get('/api/gps/navigation/:sessionId', async (req, res) => {
    try {
      const session = await storage.getNavigationSession(req.params.sessionId);
      if (!session) {
        return res.status(404).json({ error: 'Navigation session not found' });
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch navigation session' });
    }
  });

  app.put('/api/gps/navigation/:sessionId', async (req, res) => {
    try {
      const session = await storage.updateNavigationSession(req.params.sessionId, req.body);
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update navigation session' });
    }
  });

  // ===== TRACKING =====
  app.post('/api/gps/tracking', async (req, res) => {
    try {
      const point = await storage.addTrackingPoint(req.body);
      res.status(201).json(point);
    } catch (error) {
      res.status(500).json({ error: 'Failed to add tracking point' });
    }
  });

  app.get('/api/gps/tracking/:sessionId', async (req, res) => {
    try {
      const points = await storage.getTrackingPoints(req.params.sessionId);
      res.json(points);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch tracking points' });
    }
  });

  // ===== SEARCH =====
  app.get('/api/search', async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ error: 'Search query is required' });
      }
      const results = await storage.search(query);
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: 'Search failed' });
    }
  });
}
