import bcrypt from "bcrypt";
import { SignJWT, jwtVerify } from "jose";
import { Role } from "@prisma/client";
import { prisma } from "./prisma";
import { HttpError } from "./http";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
};

function getJwtSecret() {
  const secret = process.env.JWT_SECRET || "rose-glow-dev-jwt-change-in-production";
  return new TextEncoder().encode(secret);
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
  if (!user) throw new HttpError(401, "Invalid email or password");

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new HttpError(401, "Invalid email or password");

  const accessToken = await new SignJWT({
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(process.env.JWT_EXPIRES_IN || "7d")
    .sign(getJwtSecret());

  return {
    accessToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  };
}

export async function me(userId: string) {
  return prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });
}

export async function requireUser(
  request: Request,
  roles: Role[] = [Role.ADMIN, Role.STAFF],
): Promise<AuthUser> {
  const header = request.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) throw new HttpError(401, "Unauthorized");

  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    const id = String(payload.sub || "");
    const role = payload.role as Role;
    if (!id || !role) throw new HttpError(401, "Unauthorized");
    if (!roles.includes(role)) throw new HttpError(403, "Forbidden");

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, role: true },
    });
    if (!user) throw new HttpError(401, "Unauthorized");
    if (!roles.includes(user.role)) throw new HttpError(403, "Forbidden");

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  } catch (err) {
    if (err instanceof HttpError) throw err;
    throw new HttpError(401, "Unauthorized");
  }
}
