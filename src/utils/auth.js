import { jwtDecode } from 'jwt-decode';

export const isTokenValid = (token) => {
  if (!token) return false;

  try {
    const decoded = jwtDecode(token); // ✅ NOT destructured
    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  } catch (e) {
    console.error("Token validation error:", e);
    return false;
  }
};