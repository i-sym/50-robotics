/**
 * Gets a value from a nested object using a path string
 * Example: getValueFromPath({ meters: [{ power: 100 }] }, 'meters[0].power')
 */
export function getValueFromPath(obj: any, path: string): any {
    if (!obj || !path) {
        return undefined;
    }

    // Handle array indices in the path (e.g., 'meters[0].power')
    const normalizedPath = path.replace(/\[(\d+)\]/g, '.$1');
    const parts = normalizedPath.split('.');

    let current = obj;

    for (const part of parts) {
        if (current === null || current === undefined) {
            return undefined;
        }

        current = current[part];
    }

    return current;
}