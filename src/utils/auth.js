const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const API_URL = import.meta.env.VITE_API_URL;
const REDIRECT_URI = `${API_URL}/api/auth/callback`;
const API_ORIGIN = new URL(API_URL).origin;

export const initiateGoogleLogin = () => {
  return new Promise((resolve, reject) => {
    const scope = [
      'openid',
      'email',
      'profile',
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.modify',
      'https://www.googleapis.com/auth/gmail.send'
    ].join(' ');

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${GOOGLE_CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
      `&response_type=code` +
      `&scope=${encodeURIComponent(scope)}` +
      `&access_type=offline` +
      `&prompt=consent`;

    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      authUrl,
      'Google Login',
      `width=${width},height=${height},left=${left},top=${top}`
    );

    // Listen for message from popup
    const messageHandler = async (event) => {
      if (event.origin !== API_ORIGIN) return;

      if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
        window.removeEventListener('message', messageHandler);
        popup?.close();

        // Store tokens
        localStorage.setItem('accessToken', event.data.accessToken);
        localStorage.setItem('userEmail', event.data.email);
        if (event.data.name) localStorage.setItem('userName', event.data.name);

        resolve(event.data);
      } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
        window.removeEventListener('message', messageHandler);
        popup?.close();
        reject(new Error(event.data.error));
      }
    };

    window.addEventListener('message', messageHandler);
  });
};

export const getAccessToken = () => {
  return localStorage.getItem('accessToken');
};

export const getUserEmail = () => {
  return localStorage.getItem('userEmail');
};

export const logout = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('userEmail');
};
