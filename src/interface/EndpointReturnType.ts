type TEndpointErrorReturnType = {
    success: false;
    data: { error?: string; info?: unknown };
};

type TEndpointSuccessReturnType<T> = {
    success: true;
    data: T;
};

/**
 * Exported Members
 */
export type EndpointReturnType<T> = TEndpointErrorReturnType | TEndpointSuccessReturnType<T>;
