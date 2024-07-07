import { tools, ZObject } from "zapier-platform-core";
import {
  getAuthorizationUrl,
  getCodeChallenge,
  getState,
} from "../services/auth";
import { mock } from "jest-mock-extended";

tools.env.inject();
const mockedZObject = mock<ZObject>();

describe("Getting authorization url", () => {
  it("should return the url in the acceptable format for canva connect api authentication", () => {
    const redirectUrl = "redirect-url";
    const state = getState();
    const codeChallenge = getCodeChallenge();
    const clientId = process.env.CANVA_CLIENT_ID;

    const url = getAuthorizationUrl(
      mockedZObject,
      redirectUrl,
      state,
      codeChallenge
    );

    const expectedUrl = `https://www.canva.com/api/oauth/authorize?code_challenge=${codeChallenge}&code_challenge_method=S256&scope=asset%3Aread+asset%3Awrite+brandtemplate%3Acontent%3Aread+brandtemplate%3Ameta%3Aread+design%3Acontent%3Aread+design%3Acontent%3Awrite+design%3Ameta%3Aread+profile%3Aread&response_type=code&client_id=${clientId}&redirect_uri=${redirectUrl}&state=${state}`;

    expect(url).toBeDefined();
    expect(url).toEqual(expectedUrl);
  });
});
