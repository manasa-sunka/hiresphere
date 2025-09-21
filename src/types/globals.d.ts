export {}

// Create a type for the roles
export type Roles = 'admin' | 'student' | 'alumni'

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: Roles
    }
  }
}