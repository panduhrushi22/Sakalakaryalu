import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'sakalakaryalu_secret_dev_key';

export interface DecodedToken {
  id: string;
  email: string;
  name: string;
  role: string;
}

export function getDecodedToken(request: Request): DecodedToken | null {
  try {
    let token: string | null = null;

    // 1. Try to get from Authorization header
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    // 2. Try to get from HTTP-only cookie
    if (!token || token === 'cookie_session_active') {
      const cookieHeader = request.headers.get('cookie') || '';
      const match = cookieHeader.match(/authToken=([^;]+)/);
      if (match) {
        token = decodeURIComponent(match[1]);
      }
    }

    if (!token) {
      return null;
    }

    return jwt.verify(token, JWT_SECRET) as DecodedToken;
  } catch {
    return null;
  }
}

export function verifyAdminAccess(request: Request, allowedRoles: string[]): boolean {
  const decoded = getDecodedToken(request);
  if (!decoded) return false;
  return allowedRoles.includes(decoded.role);
}
