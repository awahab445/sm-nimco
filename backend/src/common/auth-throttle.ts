/** Per-IP cap for login / signup / password endpoints (brute-force guard). */
export const AUTH_THROTTLE = { default: { limit: 5, ttl: 60_000 } };
