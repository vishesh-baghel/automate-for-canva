import { Bundle, HttpRequestOptions, ZObject } from "zapier-platform-core";
import * as crypto from "crypto";
import configs from "../configs/app.configs.json";

async function getAccessToken(z: ZObject, bundle: Bundle) {
  const url = getAuthorizationUrl(
    z,
    configs.endpoints.ZAPIER_DEFAULT_REDIRECT_URL,
    getState(),
    getCodeChallenge()
  );

  const response = await z.request({
    url: url,
    method: "POST",
    body: {
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      grant_type: "authorization_code",
      code: bundle.inputData.code,
    },
    headers: { "content-type": "application/x-www-form-urlencoded" },
  });

  console.log(response);
  return {
    access_token: response.data.access_token,
    refresh_token: response.data.refresh_token,
  };
}

export function getState() {
  return crypto.randomBytes(96).toString("base64url");
}

export function getCodeChallenge() {
  return crypto
    .createHash("sha256")
    .update(getCodeVerifier())
    .digest("base64url");
}

export function getCodeVerifier() {
  return crypto.randomBytes(96).toString("base64url");
}

const refreshAccessToken = async (z: ZObject, bundle: Bundle) => {
  const response = await z.request({
    url: configs.endpoints.CANVA_TOKEN_URL,
    method: "POST",
    body: {
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: bundle.authData.refresh_token,
    },
    headers: { "content-type": "application/x-www-form-urlencoded" },
  });

  // This function should return `access_token`.
  // If the refresh token stays constant, no need to return it.
  // If the refresh token does change, return it here to update the stored value in
  // Zapier
  return {
    access_token: response.data.access_token,
    refresh_token: response.data.refresh_token,
  };
};

const includeBearerToken = (
  request: HttpRequestOptions,
  z: ZObject,
  bundle: Bundle
) => {
  if (bundle.authData.access_token && request.headers != undefined) {
    request.headers["Authorization"] = `Bearer ${bundle.authData.access_token}`;
  }

  return request;
};

/**
 * Generates an authorization URL for Canva OAuth flow.
 * @param {string} redirectUri - The redirect URI after authorization.
 * @param {string} state - The CSRF-protection state parameter
 * The state parameter will be returned to you after successful authorization.
 * You need to set something here, so that when it's returned, you can verify
 * that you started the flow (and this is the correct user etc).
 * @param {string} codeChallenge - The PKCE code-challenge value
 * @returns {Promise<string>} The authorization URL.
 */
export function getAuthorizationUrl(
  z: ZObject,
  redirectUri: string,
  state: string,
  codeChallenge: string
): string {
  const scopes = [
    "asset:read",
    "asset:write",
    "brandtemplate:content:read",
    "brandtemplate:meta:read",
    "design:content:read",
    "design:content:write",
    "design:meta:read",
    "profile:read",
  ];
  const scopeString = scopes.join(" ");

  const clientId = process.env.CANVA_CLIENT_ID;
  if (!clientId) {
    throw new z.errors.Error("'CANVA_CLIENT_ID' env variable not found.");
  }

  const url = new URL(configs.endpoints.CANVA_AUTH_URL);
  url.searchParams.append("code_challenge", codeChallenge);
  url.searchParams.append("code_challenge_method", "S256");
  url.searchParams.append("scope", scopeString);
  url.searchParams.append("response_type", "code");
  url.searchParams.append("client_id", clientId);
  url.searchParams.append("redirect_uri", redirectUri);
  url.searchParams.append("state", state);

  return url.toString();
}

export default {
  config: {
    type: "oauth2",
    oauth2Config: {
      authorizeUrl: {
        url: configs.endpoints.CANVA_AUTH_URL,
        params: {
          client_id: "{{process.env.CLIENT_ID}}",
          state: "{{bundle.inputData.state}}",
          redirect_uri: "{{bundle.inputData.redirect_uri}}",
          response_type: "code",
        },
      },
      getAccessToken,
      refreshAccessToken,
      autoRefresh: true,
    },
  },
  befores: [includeBearerToken],
  afters: [],
};
