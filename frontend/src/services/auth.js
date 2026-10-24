import { CognitoUserPool, CognitoUser, AuthenticationDetails, CognitoUserAttribute } from "amazon-cognito-identity-js";

// User pool app client must have NO client secret (browser app).
const pool = new CognitoUserPool({
  UserPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
  ClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
});

export const register = (email, password) =>
  new Promise((res, rej) =>
    pool.signUp(email, password, [new CognitoUserAttribute({ Name: "email", Value: email })], null,
      (err, r) => (err ? rej(err) : res(r)))
  );

export const confirmRegistration = (email, code) =>
  new Promise((res, rej) =>
    new CognitoUser({ Username: email, Pool: pool }).confirmRegistration(code, true, (e, r) => (e ? rej(e) : res(r)))
  );

export const login = (email, password) =>
  new Promise((res, rej) => {
    const user = new CognitoUser({ Username: email, Pool: pool });
    user.authenticateUser(new AuthenticationDetails({ Username: email, Password: password }), {
      onSuccess: (s) => res(s),
      onFailure: rej,
    });
  });

export const logout = () => pool.getCurrentUser()?.signOut();

// Returns a fresh access token (auto-refreshes) or null.
export const getToken = () =>
  new Promise((res) => {
    const user = pool.getCurrentUser();
    if (!user) return res(null);
    user.getSession((err, session) => (err || !session?.isValid() ? res(null) : res(session.getAccessToken().getJwtToken())));
  });

export const getEmail = () =>
  new Promise((res) => {
    const user = pool.getCurrentUser();
    if (!user) return res(null);
    user.getSession(() => user.getUserAttributes((e, a) => res(e ? null : a.find((x) => x.Name === "email")?.Value)));
  });
