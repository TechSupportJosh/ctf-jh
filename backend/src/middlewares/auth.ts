import { Request, Response, NextFunction } from "express";
import { User } from "../entity/User";

export const getUserFromCookie = async (authCookie: string) => {
  if (!authCookie) return null;

  const user = await User.findOne({ where: { authValue: authCookie }, relations: ["team"] });
  if (!user) return null;
  if (user.authExpiry < new Date()) return null;

  return user;
};

export const isAuthenticated = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = await getUserFromCookie(req.cookies.auth);

    if (!user) return res.status(401).send({ message: "Requires authentication" });

    req.user = user;
    return next();
  };
};

export const isAdmin = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = await getUserFromCookie(req.cookies.auth);

    if (!user) return res.status(401).send({ message: "Requires authentication" });
    if (!user.isAdmin) return res.status(401).send({ message: "Requires authentication" });

    req.user = user;
    return next();
  };
};
