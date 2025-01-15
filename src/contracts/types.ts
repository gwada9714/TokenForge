import { Contract } from 'ethers';

export enum PlanType {
  Apprenti,
  Forgeron,
  MaitreForgeron
}

export interface Plan {
  name: string;
  price: bigint;
  isActive: boolean;
}

export interface TokenForgePlansContract extends Contract {
  plans(planType: PlanType): Promise<Plan>;
  userPlans(address: string): Promise<PlanType>;
  purchasePlan(planType: PlanType): Promise<any>;
  updatePlanPrice(planType: PlanType, newPrice: bigint): Promise<any>;
  getUserPlan(user: string): Promise<PlanType>;
  withdraw(): Promise<any>;
}

export interface Lock {
  token: string;
  amount: bigint;
  unlockTime: bigint;
  isWithdrawn: boolean;
}

export interface LiquidityLockerContract extends Contract {
  locks(owner: string, index: number): Promise<Lock>;
  lockLiquidity(token: string, amount: bigint, lockDuration: bigint): Promise<any>;
  unlockLiquidity(lockIndex: number): Promise<any>;
  getLocks(owner: string): Promise<Lock[]>;
}
