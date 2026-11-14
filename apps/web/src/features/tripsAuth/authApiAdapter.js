import authApi from '@utils/api/authApi';
import {activeTripsSignup} from './signupSession.js';
import {createSignupFlow} from './signupFlow.js';
export default {
  ...authApi,
  ...createSignupFlow({api: authApi, isActive: activeTripsSignup}),
};
