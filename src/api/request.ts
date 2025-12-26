import axios from 'axios';


const instance = axios.create({
  baseURL: 'https://trello-back.shpp.me/RomanDiachenko/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

instance.interceptors.response.use(
  (res) => res.data,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.log('Token expired or invalid');
    }
    return Promise.reject(error);
  }
);

export default instance;