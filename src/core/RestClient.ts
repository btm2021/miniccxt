import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

export class RestClient {
    private axiosInstance: AxiosInstance;

    constructor(baseURL: string) {
        this.axiosInstance = axios.create({
            baseURL,
            timeout: 10000,
        });
    }

    async get<T>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.axiosInstance.get<T>(url, { ...config, params });
        return response.data;
    }

    async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.axiosInstance.post<T>(url, data, config);
        return response.data;
    }
}
