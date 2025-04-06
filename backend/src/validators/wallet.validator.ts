import { body } from "express-validator";

export const createWalletSchema = [
  body("userId")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1 })
    .withMessage("User ID must not be empty"),

  body("expiresIn")
    .optional()
    .isInt({ min: 1, max: 72 })
    .withMessage("Expiration time must be between 1 and 72 hours"),
];
