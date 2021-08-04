import express from "express";
import { User } from "../entity/User";
import { getAccessToken, getAuthorizationURI, getUserAttributes } from "../utils/warwickapi";
import { getUserFromCookie } from "../middlewares/auth";
import { validator } from "../middlewares/validator";
import { LoginDTO } from "../dto/Login";
import { verifyPassword } from "../utils/password";

const router = express.Router();

const adminIds = process.env.WARWICK_ADMIN_IDS ? process.env.WARWICK_ADMIN_IDS.split(",") : [];
const whitelistedIds = process.env.WARWICK_WHITELIST_IDS ? process.env.WARWICK_WHITELIST_IDS.split(",") : [];
const whitelistedCourses = process.env.WARWICK_WHITELIST_COURSES ? process.env.WARWICK_WHITELIST_COURSES.split(",") : [];

router.get("/warwick", async (req, res) => {
  const authorizationUri = await getAuthorizationURI();

  if (!authorizationUri) return res.redirect("/login?error=oauth");

  res.redirect(authorizationUri);
});

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
    console.log(adminIds);

    user = User.create({
      warwickId: parseInt(attributes.id),
      firstName: attributes.firstname,
      lastName: attributes.lastname,
      isAdmin: adminIds.includes(attributes.id),
    });
  }

  user.createAuth();

  res.cookie("auth", user.authValue, {
    expires: user.authExpiry,
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

  user.createAuth();

  res.cookie("auth", user.authValue, {
    expires: user.authExpiry,
    httpOnly: true,
    sameSite: "strict",
  });

  await user.save();

  res.redirect("/");
});

router.get("/logout", async (req, res) => {
  const user = await getUserFromCookie(req.cookies.auth);

  if (!user) return res.redirect("/login");

  user.clearAuth();

  await user.save();

  res.redirect("/login");
});

export const authRouter = router;
