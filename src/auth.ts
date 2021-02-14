const loco = window.location;
const appRootUrl = `${loco.protocol}//${loco.host}${process.env.BASE_URL}`;

const authority = process.env.VUE_APP_AUTH_AUTHORITY;
const redirectUri = process.env.VUE_APP_AUTH_REDIRECT_URI;
const popupRedirectUri = process.env.VUE_APP_AUTH_POPUP_REDIRECT_URI;
const postLogoutRedirectUri = process.env.VUE_APP_AUTH_POST_LOGOUT_REDIRECT_URI;
const silentRedirectUri = process.env.VUE_APP_AUTH_SILENT_REDIRECT_URI;

const oidcSettings = {
  authority: authority,
  //authority: 'https://localhost:44396',
  clientId: 'rabudget',
  redirectUri: redirectUri,
  popupRedirectUri: popupRedirectUri,
  postLogoutRedirectUri: postLogoutRedirectUri,
  responseType: 'code',
  scope: 'openid profile email rabudget',
  automaticSilentRenew: true,
  automaticSilentSignin: false,
  silentRedirectUri: silentRedirectUri,
};

export default oidcSettings;
