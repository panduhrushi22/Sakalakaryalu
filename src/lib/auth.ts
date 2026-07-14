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
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    const token = authHeader.split(' ')[1];
    return jwt.verify(token, JWT_SECRET) as DecodedToken;
  } catch (e) {
    return null;
  }
}

export function verifyAdminAccess(request: Request, allowedRoles: string[]): boolean {
  const decoded = getDecodedToken(request);
  if (!decoded) return false;
  return allowedRoles.includes(decoded.role);
}
