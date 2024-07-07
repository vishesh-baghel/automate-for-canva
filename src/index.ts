import { Bundle, HttpRequestOptions, ZObject } from "zapier-platform-core";

import MovieCreate from "./actions/create/movie";
import MovieTrigger from "./triggers/movie";
import { version as platformVersion } from "zapier-platform-core";
import { validateEnvironmentVariables } from "./services/env";
import authentication from "./services/auth";

const { version } = require("../package.json");

const addApiKeyHeader = (
  req: HttpRequestOptions,
  z: ZObject,
  bundle: Bundle
) => {
  // Hard-coded api key just to demo. DON'T do auth like this for your production app!
  req.headers = req.headers || {};
  req.headers["X-Api-Key"] = "secret";
  return req;
};

export default {
  version,
  platformVersion,
  authentication,

  // beforeApp: [validateEnvironmentVariables],

  beforeRequest: [validateEnvironmentVariables, addApiKeyHeader],

  triggers: {
    [MovieTrigger.key]: MovieTrigger,
  },

  creates: {
    [MovieCreate.key]: MovieCreate,
  },
};
