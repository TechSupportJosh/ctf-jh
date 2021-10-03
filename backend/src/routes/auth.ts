import express from "express";
import { User, UserAuth } from "../entity/User";
import { getAccessToken, getAuthorizationURI, getUserAttributes } from "../utils/warwickapi";
import { getUserFromCookie } from "../middlewares/auth";
import { validator } from "../middlewares/validator";
import { LoginDTO } from "../dto/Login";
import { verifyPassword } from "../utils/password";
import { randomBytes } from "crypto";
import { logEvent } from "../utils/log";
import { EventType } from "../entity/Log";

const router = express.Router();

const adminIds = process.env.WARWICK_ADMIN_IDS ? process.env.WARWICK_ADMIN_IDS.split(",") : [];
const whitelistedIds = process.env.WARWICK_WHITELIST_IDS ? process.env.WARWICK_WHITELIST_IDS.split(",") : [];
const whitelistedCourses = process.env.WARWICK_WHITELIST_COURSES ? process.env.WARWICK_WHITELIST_COURSES.split(",") : [];

router.get("/warwick", async (req, res) => {
  const authorizationUri = await getAuthorizationURI();

  if (!authorizationUri) return res.redirect("/login?error=oauth");

  res.redirect(authorizationUri);
});

const createAuth = async (req: express.Request, user: User) => {
  // Create new auth string + expiry time in 3 days
  const daysBeforeExpires = 3;
  const cookieValue = randomBytes(32).toString("base64");
  const expiryDate = new Date();
  expiryDate.setDate(new Date().getDate() + daysBeforeExpires);

  logEvent(EventType.AuthSuccess, {
    "user:userId": user.id,
    userAgent: req.headers["user-agent"] ?? "N/A",
    ipAddress: req.ip,
  });

  return await UserAuth.create({
    user: user,
    creationDate: new Date(),
    cookieValue: cookieValue,
    expiryDate: expiryDate,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"] ?? "N/A",
  }).save();
};

router.get("/callback", async (req, res) => {
  // Attempt to get profile
  const accessToken = await getAccessToken(req.query.oauth_token?.toString() ?? "");

  if (!accessToken) return res.redirect("/login?error=oauth");

  const attributes = await getUserAttributes(accessToken);

  if (!attributes) return res.redirect("/login?error=oauth");

  // Now evaluate whether this user can currently login in (i.e. check whitelists)
  if (whitelistedCourses.length || whitelistedIds.length) {
    if (!whitelistedCourses.includes(attributes.warwickcoursecode) && !whitelistedIds.includes(attributes.id))
      return res.redirect("/login?error=no-access");
  }

  let user = await User.findOne({ warwickId: parseInt(attributes.id) });

  if (!user) {
    user = await User.create({
      warwickId: parseInt(attributes.id),
      firstName: attributes.firstname,
      lastName: attributes.lastname,
      isAdmin: adminIds.includes(attributes.id),
    }).save();
  }

  const userAuth = await createAuth(req, user);

  res.cookie("auth", userAuth.cookieValue, {
    expires: userAuth.expiryDate,
    httpOnly: true,
    sameSite: "strict",
  });

  await user.save();

  res.redirect("/");
});

router.post("/login", validator(LoginDTO), async (req, res) => {
  const login = res.locals.dto as LoginDTO;

  const user = await User.createQueryBuilder("user").addSelect("user.password").where({ username: login.username }).getOne();

  if (!user) return res.redirect("/login?error=invalid-creds");
  if (!user.password) return res.redirect("/login?error=invalid-creds");
  if (!verifyPassword(login.password, user.password)) return res.redirect("/login?error=invalid-creds");

  const userAuth = await createAuth(req, user);

  res.cookie("auth", userAuth.cookieValue, {
    expires: userAuth.expiryDate,
    httpOnly: true,
    sameSite: "strict",
  });

  await user.save();

  res.redirect("/");
});

router.get("/logout", async (req, res) => {
  const user = await getUserFromCookie(req.cookies.auth);

  if (!user) return res.redirect("/login");

  await UserAuth.delete({ cookieValue: req.cookies.auth });

  res.redirect("/login?success=logged-out");
});

export const authRouter = router;
