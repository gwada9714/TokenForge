import mongoose from "mongoose";
import logger from "../utils/logger";

export const setupDatabase = async () => {
  try {
    const mongoUri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/tokenforge";

    await mongoose.connect(mongoUri);

    logger.info("Connected to MongoDB successfully");

    mongoose.connection.on("error", (error) => {
      logger.error("MongoDB connection error:", error);
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB disconnected");
    });

    // Handle application termination
    process.on("SIGINT", async () => {
      try {
        await mongoose.connection.close();
        logger.info("MongoDB connection closed through app termination");
        process.exit(0);
      } catch (error) {
        logger.error("Error closing MongoDB connection:", error);
        process.exit(1);
      }
    });
  } catch (error) {
    logger.error("Error connecting to MongoDB:", error);
    throw error;
  }
};
