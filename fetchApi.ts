interface FetchOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
    body?: any;
    headers?: Record<string, string>;
    timeout?: number;
}

interface FetchResult<T = any> {
    success: boolean;
    result?: T;
    error?: {
        message: string;
        status?: number;
    };
}

const MECHA_AGENT_SERVER_URL = process.env.MECHA_AGENT_SERVER_URL!

class FetchApi {
    private defaultTimeout: number;

    constructor(private apiKey: string, defaultTimeout: number = 10000) {
        this.defaultTimeout = defaultTimeout;
    }

    private async request<T = unknown>(
        path: string,
        options: FetchOptions = {}
    ): Promise<FetchResult<T>> {
        const {
            method = 'GET',
            body,
            headers = {},
            timeout = this.defaultTimeout
        } = options;

        try {
            const fetchOptions: RequestInit = {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + this.apiKey,
                    ...headers
                }
            };

            if (body) {
                if (typeof body === 'string') {
                    fetchOptions.body = body;
                } else if (body instanceof FormData) {
                    fetchOptions.body = body;
                } else {
                    fetchOptions.body = JSON.stringify(body);
                }
            }

            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), timeout);

            const response = await fetch(`${MECHA_AGENT_SERVER_URL}/api/${path}`, {
                ...fetchOptions,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            const res = await response.json() as { result?: T, error?: string }

            if (!response.ok) {
                return {
                    success: false,
                    error: {
                        message: res.error || 'Unexpected Error',
                        status: response.status,
                    }
                };
            }

            return {
                success: true,
                result: res.result
            };

        } catch (error) {
            if (error instanceof Error) {
                if (error.name === 'AbortError') {
                    return {
                        success: false,
                        error: {
                            message: `Request timeout after ${timeout}ms`
                        }
                    };
                }

                return {
                    success: false,
                    error: {
                        message: error.message
                    }
                };
            }

            return {
                success: false,
                error: {
                    message: 'Unknown error occurred'
                }
            };
        }
    }

    async get<T = any>(url: string, options: Omit<FetchOptions, 'method' | 'body'> = {}): Promise<FetchResult<T>> {
        return this.request<T>(url, { ...options, method: 'GET' });
    }

    async post<T = any>(url: string, body?: any, options: Omit<FetchOptions, 'method' | 'body'> = {}): Promise<FetchResult<T>> {
        return this.request<T>(url, { ...options, method: 'POST', body });
    }

    async put<T = any>(url: string, body?: any, options: Omit<FetchOptions, 'method' | 'body'> = {}): Promise<FetchResult<T>> {
        return this.request<T>(url, { ...options, method: 'PUT', body });
    }

    async delete<T = any>(url: string, options: Omit<FetchOptions, 'method'> = {}): Promise<FetchResult<T>> {
        return this.request<T>(url, { ...options, method: 'DELETE' });
    }

    async patch<T = any>(url: string, body?: any, options: Omit<FetchOptions, 'method' | 'body'> = {}): Promise<FetchResult<T>> {
        return this.request<T>(url, { ...options, method: 'PATCH', body });
    }
}

const fetchApi = new FetchApi(process.env.MECHA_AGENT_API_KEY!);

export { FetchApi, fetchApi };
export type { FetchResult };
export default fetchApi;
