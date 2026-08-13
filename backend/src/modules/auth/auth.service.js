import { prisma } from "../../config/prisma.js";
import { ApiError } from "../../utils/ApiError.js";
import { hashPassword, comparePassword } from "../../utils/password.js";
import { signToken } from "../../utils/jwt.js";

const toPublicUser = (user) => ({
  id: user.id,
  username: user.username,
  createdAt: user.createdAt,
});

export const signup = async ({ username, password }) => {
  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    throw new ApiError(409, "This username is already taken");
  }

  const hashedPassword = await hashPassword(password);
  const user = await prisma.user.create({
    data: { username, password: hashedPassword },
  });

  const token = signToken({ sub: user.id, username: user.username });
  return { user: toPublicUser(user), token };
};

export const login = async ({ username, password }) => {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    throw new ApiError(401, "Invalid username or password");
  }

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid username or password");
  }

  const token = signToken({ sub: user.id, username: user.username });
  return { user: toPublicUser(user), token };
};
