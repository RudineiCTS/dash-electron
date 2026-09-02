import axios from 'axios';

const API_HOST = import.meta.env.VITE_API_HOST || 'localhost:5225';

export const api = axios.create({
    baseURL: `http://${API_HOST}/api`
})

export const apiParams = axios.create({
    baseURL: `http://${API_HOST}/Campaign/Params/Detail`
})