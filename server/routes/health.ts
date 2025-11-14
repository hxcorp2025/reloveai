import { Router } from "express";
import type { HealthResponse } from "@shared/schema";

const router = Router();

router.get("/", (req, res) => {
  const response: HealthResponse = {
    ok: true,
    service: "relove-ai",
    time: new Date().toISOString()
  };
  
  res.json(response);
});

export default router;
