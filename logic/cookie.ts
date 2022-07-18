const genericAttributes = "Path=/; Secure; HttpOnly";

export function generateClearCookieString(name: string): string {
  return `${name}=; ${genericAttributes}; Expires=Thu, 01 Jan 1970 00:00:00 GMT`
}

export function generateSetCookieString(name: string, value: string, ttlMs: number): string {
  const deadline = new Date(Date.now() + ttlMs);
  return `${name}=${value}; ${genericAttributes}; Expires=${deadline.toUTCString()}`
}