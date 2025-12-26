import axios from 'axios';
import { api } from '../common/constants';

const instance = axios.create({
  baseURL: api.baseURL,
  headers: {
    'Content-Type': 'application/json',
    // ВАЖЛИВО: Тут НЕМАЄ Authorization, бо він додається динамічно нижче
  },
});

// Додаємо токен перед кожним запитом
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Обробляємо відповідь
instance.interceptors.response.use(
  (res) => res.data, // Якщо все ок - віддаємо дані
  (error) => {
    // Якщо сервер каже 401 (Unauthorized), значить токен "здох"
    if (error.response && error.response.status === 401) {
      console.log('Token expired or invalid');
      // Опціонально: можна розкоментувати, щоб примусово викидати на логін
      // localStorage.removeItem('token');
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default instance;