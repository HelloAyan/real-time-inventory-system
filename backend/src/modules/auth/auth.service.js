import { prisma } from "../../config/prisma.js";
import { ApiError } from "../../utils/ApiError.js";
import { hashPassword, comparePassword } from "../../utils/password.js";
import { signToken } from "../../utils/jwt.js";

const toPublicUser = (user) => ({
  id: user.id,
  name: user.name,
  createdAt: user.createdAt,
});

export const signup = async ({ name, password }) => {
  const existing = await prisma.user.findUnique({ where: { name } });
  if (existing) {
    throw new ApiError(409, "This name is already taken");
  }

  const hashedPassword = await hashPassword(password);
  const user = await prisma.user.create({
    data: { name, password: hashedPassword },
  });

  const token = signToken({ sub: user.id, name: user.name });
  return { user: toPublicUser(user), token };
};

export const login = async ({ name, password }) => {
  const user = await prisma.user.findUnique({ where: { name } });
  if (!user) {
    throw new ApiError(401, "Invalid name or password");
  }

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid name or password");
  }

  const token = signToken({ sub: user.id, name: user.name });
  return { user: toPublicUser(user), token };
};
