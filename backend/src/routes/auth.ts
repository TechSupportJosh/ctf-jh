import express from "express";
import { User } from "../entity/User";
import { getAccessToken, getAuthorizationURI, getUserAttributes } from "../utils/warwickapi";
import { randomBytes } from "crypto";

const router = express.Router();

router.get("/login", async (req, res) => {
  const authorizationUri = await getAuthorizationURI();

  if (!authorizationUri) return res.redirect("/?error=oauth");

  res.redirect(authorizationUri);
});

router.get("/callback", async (req, res) => {
  // Attempt to get profile
  const accessToken = await getAccessToken(req.query.oauth_token?.toString() ?? "");

  if (!accessToken) return res.redirect("/?error=oauth");

  const attributes = await getUserAttributes(accessToken);

  if (!attributes) return res.redirect("/?error=oauth");

  let user = await User.findOne({ warwickId: parseInt(attributes.id) });

  if (!user) {
    user = new User();
    user.warwickId = parseInt(attributes.id);
    user.firstName = attributes.firstname;
    user.lastName = attributes.lastname;
    // TODO: Remove hardcoded admin ID
    user.isAdmin = attributes.id === "1906821";
  }

  // Create new auth string + expiry time in 3 days
  const daysBeforeExpires = 3;
  const authValue = randomBytes(48).toString("base64");
  const authExpiry = new Date();
  authExpiry.setDate(new Date().getDate() + daysBeforeExpires);

  user.authValue = authValue;
  user.authExpiry = authExpiry;

  res.cookie("auth", authValue, {
    maxAge: daysBeforeExpires * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "strict",
  });

  const resp = await user.save();
  console.log("User saved: ", resp);

  res.redirect("/");
});

// Do a generic catch all incase they ever land on auth
router.get("*", (req, res) => {
  res.redirect(`${req.baseUrl}/login`);
});

export const authRouter = router;
