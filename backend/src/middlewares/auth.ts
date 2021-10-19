import { Request, Response, NextFunction } from "express";
import { User, UserAuth } from "../entity/User";

export const getUserFromCookie = async (authCookie: string) => {
  if (!authCookie) return null;

  const userAuth = await UserAuth.findOne({ cookieValue: authCookie });

  if (!userAuth) return null;
  if (userAuth.expiryDate < new Date()) return null;

  return (
    (await User.createQueryBuilder("user")
      .leftJoinAndSelect("user.team", "team")
      // .leftJoin("user.team", "team")
      // .addSelect("team.id", "id")
      // .addSelect("team.name", "name")
      .where({ id: userAuth.userId })
      .getOne()) ?? null
  );
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
