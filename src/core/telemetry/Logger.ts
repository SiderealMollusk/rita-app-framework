export class Logger {
    static info(message: string, meta?: any): void {
        console.log(`[INFO] ${message}`, meta || '');
    }
    static error(message: string, meta?: any): void {
        console.error(`[ERROR] ${message}`, meta || '');
    }
    static debug(message: string, meta?: any): void {
        if (process.env.DEBUG) {
            console.debug(`[DEBUG] ${message}`, meta || '');
        }
    }
}
