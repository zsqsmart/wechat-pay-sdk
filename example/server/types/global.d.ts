import 'fastify';
import 'nestjs-cls';

declare module 'fastify' {
  interface FastifyRequest {
    user: {
      id: number;
      email: string;
    };
  }
}

declare module 'nestjs-cls' {
  interface ClsStore {
    userId: number;
    user: {
      id: number;
      email: string;
    };
  }
}
