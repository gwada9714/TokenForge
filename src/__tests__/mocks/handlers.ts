import { http, HttpResponse } from 'msw';

export const handlers = [
  // Mock Firebase Auth REST API
  http.post('https://*.firebaseauth.com/v1/accounts:signInWithPassword', async ({ request }) => {
    return HttpResponse.json({
      kind: 'identitytoolkit#VerifyPasswordResponse',
      localId: 'testUserId',
      email: 'test@example.com',
      idToken: 'fake-id-token'
    });
  }),

  http.post('https://*.firebaseauth.com/v1/accounts:signUp', async () => {
    return HttpResponse.json({
      kind: 'identitytoolkit#SignupNewUserResponse',
      localId: 'newTestUserId',
      email: 'newuser@example.com',
      idToken: 'fake-id-token'
    });
  }),

  // Mock Firebase Firestore REST API
  http.get('https://firestore.googleapis.com/v1/projects/*/databases/(default)/documents/*', async () => {
    return HttpResponse.json({ documents: [] });
  })
];
