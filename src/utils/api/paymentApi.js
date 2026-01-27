import axios from './axiosInstance';

const paymentApi = {
  tossReady: (data) =>
    axios.post('/payments/toss/ready', data),
};

export default paymentApi;