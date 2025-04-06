import { Request, Response, NextFunction } from "express";
import { ethers } from "ethers";
import { WalletService } from "../services/wallet.service";
import logger from "../utils/logger";

export class WalletController {
  private walletService: WalletService;

  constructor() {
    this.walletService = new WalletService();
  }

  createTemporaryWallet = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const wallet = await this.walletService.createTemporaryWallet();
      res.status(201).json({
        success: true,
        data: {
          address: wallet.address,
          expiresAt: wallet.expiresAt,
        },
      });
    } catch (error) {
      logger.error("Error creating temporary wallet:", error);
      next(error);
    }
  };

  getWalletDetails = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { address } = req.params;
      const wallet = await this.walletService.getWalletByAddress(address);

      if (!wallet) {
        return res.status(404).json({
          success: false,
          error: "Wallet not found",
        });
      }

      res.json({
        success: true,
        data: wallet,
      });
    } catch (error) {
      logger.error("Error getting wallet details:", error);
      next(error);
    }
  };

  getWalletBalance = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { address } = req.params;
      const balance = await this.walletService.getWalletBalance(address);

      res.json({
        success: true,
        data: {
          balance,
          address,
        },
      });
    } catch (error) {
      logger.error("Error getting wallet balance:", error);
      next(error);
    }
  };
}
