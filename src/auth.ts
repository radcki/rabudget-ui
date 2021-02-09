const loco = window.location;
const appRootUrl = `${loco.protocol}//${loco.host}${process.env.BASE_URL}`;

const oidcSettings = {
  authority: 'https://auth.rabt.pl',
  //authority: 'https://localhost:44396',
  clientId: 'rabudget',
  redirectUri: 'https://localhost:8080/auth/signinwin/main',
  popupRedirectUri: 'https://localhost:8080/auth/signinpop/main',
  postLogoutRedirectUri: 'https://localhost:8080/signed-out',
  responseType: 'code',
  scope: 'openid profile email rabudget',
  automaticSilentRenew: true,
  automaticSilentSignin: false,
  silentRedirectUri: 'http://localhost:8080/silent-renew-oidc.html',
};

export default oidcSettings;
