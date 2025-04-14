import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // API route to get the current likes count
  app.get("/api/likes", async (req, res) => {
    try {
      const likeCounter = await storage.getLikeCounter();
      res.json(likeCounter);
    } catch (error) {
      res.status(500).json({ message: "Failed to get likes count" });
    }
  });

  // API route to increment the likes count
  app.post("/api/likes/increment", async (req, res) => {
    try {
      const updatedCounter = await storage.incrementLikes();
      res.json(updatedCounter);
    } catch (error) {
      res.status(500).json({ message: "Failed to increment likes count" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
