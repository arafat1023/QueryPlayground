// Basic debounce implementation
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => void>(
    func: T,
    wait: number
): ((...args: Parameters<T>) => void) & { cancel: () => void } {
    let timeout: ReturnType<typeof setTimeout> | null = null;

    const debounced = (...args: Parameters<T>) => {
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(() => {
            func(...args);
            timeout = null;
        }, wait);
    };

    debounced.cancel = () => {
        if (timeout) {
            clearTimeout(timeout);
            timeout = null;
        }
    };

    return debounced;
}
