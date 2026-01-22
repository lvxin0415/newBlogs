import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

// 生产环境使用相对路径（同域部署），开发环境使用 localhost
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? '/api'  // 生产环境：使用相对路径
    : 'http://localhost:3001/api');  // 开发环境：使用本地后端

// 自定义 API 实例类型，直接返回数据而不是 AxiosResponse
interface ApiInstance extends AxiosInstance {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
}

// 创建 axios 实例
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
}) as ApiInstance;

// 请求拦截器 - 添加 token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 直接返回 data，处理错误
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const login = (username: string, password: string) =>
  api.post('/auth/login', { username, password });

export const logout = () => api.post('/auth/logout');

export const getCurrentUser = () => api.get('/auth/me');

// Article API
export const fetchArticles = (params?: any) => api.get('/articles', { params });

export const fetchArticle = (id: string | number) => api.get(`/articles/${id}`);

export const createArticle = (data: any) => api.post('/articles', data);

export const updateArticle = (id: string | number, data: any) =>
  api.put(`/articles/${id}`, data);

export const deleteArticle = (id: string | number) => api.delete(`/articles/${id}`);

// Category API
export const fetchCategories = () => api.get('/categories');

export const fetchCategory = (id: string | number) => api.get(`/categories/${id}`);

export const createCategory = (data: any) => api.post('/categories', data);

export const updateCategory = (id: string | number, data: any) =>
  api.put(`/categories/${id}`, data);

export const deleteCategory = (id: string | number) => api.delete(`/categories/${id}`);

// Tag API
export const fetchTags = () => api.get('/tags');

export const fetchTag = (id: string | number) => api.get(`/tags/${id}`);

export const createTag = (data: any) => api.post('/tags', data);

export const updateTag = (id: string | number, data: any) =>
  api.put(`/tags/${id}`, data);

export const deleteTag = (id: string | number) => api.delete(`/tags/${id}`);

// Upload API
export const uploadImage = (file: File) => {
  const formData = new FormData();
  formData.append('image', file);
  return api.post('/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export default api;
