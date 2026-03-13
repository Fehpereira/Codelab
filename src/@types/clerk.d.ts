export {};

export type Roles = 'admin' | 'member';

declare global {
  interface UserPublicMetadata {
    role?: Roles;
  }

  interface CustomJwtSessionClaims {
    metadata?: {
      role?: Roles;
    };
  }
}
