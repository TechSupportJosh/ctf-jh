import axios from "axios";
import OAuth from "oauth-1.0a";
import { createHmac } from "crypto";
import qs from "qs";
import { WarwickUser } from "../types/WarwickUser";
import { OAuthToken } from "../entity/OAuth";

const baseURL = "https://websignon.warwick.ac.uk/oauth";

const client = axios.create({
  baseURL: baseURL,
  validateStatus: undefined,
});

const oauth = new OAuth({
  consumer: {
    key: process.env.WARWICK_OAUTH_CONSUMER_KEY!,
    secret: process.env.WARWICK_OAUTH_CONSUMER_SECRET!,
  },
  signature_method: "HMAC-SHA1",
  hash_function(baseString, key) {
    return createHmac("sha1", key).update(baseString).digest("base64");
  },
});

export const getAuthorizationURI = async () => {
  const tokens = await getRequestToken();
  if (!tokens) return null;

  const redirectParams = new URLSearchParams();
  redirectParams.append("oauth_token", tokens.token);
  redirectParams.append("oauth_callback", process.env.OAUTH_CALLBACK_URL!);

  return baseURL + "/authorise?" + redirectParams.toString();
};

export const getRequestToken = async () => {
  const formData = oauth.authorize({
    url: baseURL + "/requestToken",
    data: {
      scope: "urn:websignon.warwick.ac.uk:sso:service",
    },
    method: "POST",
  });

  // qs is used to convert the JS object into a querystring (i.e. url encoded form)
  const response = await client.post("/requestToken", qs.stringify(formData));

  console.log(response);
  if (response.status !== 200) return null;

  const tokens = new URLSearchParams(response.data);

  const token = tokens.get("oauth_token");
  const tokenSecret = tokens.get("oauth_token_secret");

  if (!token || !tokenSecret) return null;

  const dbToken = new OAuthToken();
  const expiry = new Date(new Date().getTime() + 15 * 60 * 10000);
  dbToken.token = token;
  dbToken.tokenSecret = tokenSecret;
  dbToken.expires = expiry;

  await dbToken.save();

  return {
    token: token,
    secret: tokenSecret,
  };
};

export const getAccessToken = async (callbackToken: string) => {
  const oauthToken = await OAuthToken.findOne({ token: callbackToken });
  if (!oauthToken) return null;

  const formData = oauth.authorize(
    {
      url: baseURL + "/accessToken",
      method: "POST",
    },
    { key: oauthToken.token, secret: oauthToken.tokenSecret }
  );

  // Delete from the database
  await OAuthToken.delete(oauthToken);

  const response = await client.post<string>("/accessToken", qs.stringify(formData));

  const tokens = new URLSearchParams(response.data);

  const token = tokens.get("oauth_token");
  const tokenSecret = tokens.get("oauth_token_secret");

  if (!token || !tokenSecret) return null;

  return {
    key: token,
    secret: tokenSecret,
  };
};

export const getUserAttributes = async (token: OAuth.Token) => {
  const formData = oauth.authorize(
    {
      url: baseURL + "/authenticate/attributes",
      method: "POST",
    },
    token
  );

  const response = await client.post<string>("/authenticate/attributes", qs.stringify(formData));

  // Attempt to process response data
  const responseLines = response.data.split("\n");
  const attributes: Record<string, string> = {};

  responseLines.forEach((line) => {
    if (!line.indexOf("=")) return;

    let [attribute, ...value] = line.split("=");
    attributes[attribute] = value.join("=");
  });

  // The Warwick API will always return a "user" attribute, therefore a lack
  // of the user attribute indicates an invalid response
  if (!("user" in attributes)) return null;

  return attributes as WarwickUser;
};
