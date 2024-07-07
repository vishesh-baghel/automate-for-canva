import { ZObject } from "zapier-platform-core";

const envVars = ["CANVA_CLIENT_ID", "CANVA_CLIENT_SECRET"];

export function validateEnvironmentVariables(z: ZObject) {
  envVars.forEach((envVar: string) => {
    if (process.env[envVar] == null) {
      throw new Error(
        `Oops! We couldn't find the environment variable '${envVar}'. Please contact our support team to resolve this configuration issue.`
      );
    }

    if (process.env[envVar] === `<${envVar}>`) {
      throw new Error(
        `It looks like the environment variable '${envVar}' is still set to its placeholder value. Please contact our support team for assistance.`
      );
    }
  });

  return z;
}
