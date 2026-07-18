import rateLimit from "express-rate-limit";

/**
 * L'IA coute reellement de l'argent par appel : limite dediee pour eviter les abus
 * de l'assistant IA de liste de courses.
 */
export const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: "Trop de generations IA, veuillez reessayer plus tard.",
      meta: {
        timestamp: new Date().toISOString(),
        path: req.path,
      },
    });
  },
});
