import { ServiceType } from "@/features/services/types/services";

export interface MockServiceHook {
  configureService: (type: ServiceType, config: any) => Promise<void>;
  error: string | null;
  isProcessing: boolean;
}

export interface MockComponentProps {
  onSubmit?: (data: any) => void;
  isProcessing?: boolean;
  error?: string | null;
}

declare module "vitest" {
  interface Assertion<T = any> {
    toBeDisabled(): void;
    toBeInTheDocument(): void;
    toHaveAttribute(attr: string, value?: string): void;
  }
}
