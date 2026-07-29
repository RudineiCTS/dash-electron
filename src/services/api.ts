import axios from 'axios';

export const api = axios.create({
    baseURL:"http://localhost:5225/api"
})

export const apiParams = axios.create({
    baseURL:"http://localhost:5225/Campaign/Params/Detail"
})