/**
 * Global default for fetcher withCredentials. Set by CortiClient when withCredentials
 * is passed in options; the core fetcher reads this when args.withCredentials is undefined.
 */
let defaultWithCredentials: boolean | undefined = undefined;

export function getDefaultWithCredentials(): boolean | undefined {
    return defaultWithCredentials;
}

export function setDefaultWithCredentials(value: boolean | undefined): void {
    defaultWithCredentials = value;
}
