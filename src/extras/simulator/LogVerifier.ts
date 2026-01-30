import * as fs from 'fs';
import * as path from 'path';

export class LogVerifier {
    static verify(actualLogs: string[], goldenFilePath: string): void {
        if (!fs.existsSync(goldenFilePath)) {
            // If golden file doesn't exist, create it (useful for first run)
            fs.writeFileSync(goldenFilePath, actualLogs.join('\n') + '\n');
            console.log(`Golden file created at: ${goldenFilePath}`);
            return;
        }

        const expectedLogs = fs.readFileSync(goldenFilePath, 'utf-8').trim().split('\n');

        if (actualLogs.length !== expectedLogs.length) {
            throw new Error(`Log length mismatch. Expected ${expectedLogs.length}, got ${actualLogs.length}`);
        }

        for (let i = 0; i < actualLogs.length; i++) {
            if (actualLogs[i] !== expectedLogs[i]) {
                throw new Error(`Log mismatch at line ${i + 1}:\nExpected: ${expectedLogs[i]}\nActual:   ${actualLogs[i]}`);
            }
        }
    }
}
