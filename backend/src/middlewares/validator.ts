import { Request, Response, NextFunction } from "express";
import { validateAsClass } from "joiful";

export const validator = (dtoClass: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const result = validateAsClass(req.body, dtoClass, {
      abortEarly: false,
    });

    if (result.error) {
      return res.status(400).send({
        message: result.error.message,
      });
    }

    res.locals.dto = result.value;

    return next();
  };
};
