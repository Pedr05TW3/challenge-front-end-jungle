import axios from 'axios';
export const api=axios.create({baseURL:'/api',timeout:8000,headers:{'Content-Type':'application/json'}});
api.interceptors.response.use(r=>r,e=>Promise.reject(e));
