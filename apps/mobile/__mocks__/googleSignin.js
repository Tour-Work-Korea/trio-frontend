export const statusCodes = {};

export const GoogleSignin = {
  configure: jest.fn(),
  hasPlayServices: jest.fn().mockResolvedValue(true),
  signIn: jest.fn().mockResolvedValue({
    data: {idToken: 'test-google-id-token', user: {}},
  }),
  signOut: jest.fn().mockResolvedValue(undefined),
  isSignedIn: jest.fn().mockResolvedValue(false),
};

export const isErrorWithCode = () => false;
