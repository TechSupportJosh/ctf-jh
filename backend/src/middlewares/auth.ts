import { Request, Response, NextFunction } from "express";
import { User } from "../entity/User";

const getUserFromCookie = async (authCookie: string) => {
  if (!authCookie) return null;

  const user = await User.findOne({ authValue: authCookie });
  if (!user) return null;

  return user;
};

export const isAuthenticated = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = await getUserFromCookie(req.cookies.auth);

    if (!user) return res.redirect("/login?error=requires-auth");

    req.user = user;
    return next();
  };
};

export const isAdmin = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = await getUserFromCookie(req.cookies.auth);

    if (!user) return res.redirect("/login?error=requires-auth");
    if (!user.isAdmin) return res.redirect("/");

    req.user = user;
    return next();
  };
};
