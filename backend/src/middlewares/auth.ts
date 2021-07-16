import { Request, Response, NextFunction } from "express";
import { User } from "../entity/User";

export const isAuthenticated = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authCookie = req.cookies.auth;
    if (!authCookie) return res.redirect("/login?error=requires-auth");

    const user = await User.findOne({ authValue: authCookie });
    if (!user) return res.redirect("/login?error=requires-auth");

    req.user = user;
    return next();
  };
};
