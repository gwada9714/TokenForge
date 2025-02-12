import 'express-serve-static-core';

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      address: string;
      uid?: string;
      email?: string;
    };
  }
  interface Response<ResBody = any> {
    json(body: ResBody): this;
    status(code: number): this;
  }
}

export {};
