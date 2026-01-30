import { LogVerifier } from '../LogVerifier';
import * as fs from 'fs';

jest.mock('fs');

describe('LogVerifier', () => {
    const mockExistsFn = fs.existsSync as jest.Mock;
    const mockWriteFn = fs.writeFileSync as jest.Mock;
    const mockReadFn = fs.readFileSync as jest.Mock;
    const mockLogFn = jest.spyOn(console, 'log').mockImplementation(() => { });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create golden file if it does not exist', () => {
        mockExistsFn.mockReturnValue(false);

        LogVerifier.verify(['log1', 'log2'], 'golden.txt');

        expect(mockWriteFn).toHaveBeenCalledWith('golden.txt', 'log1\nlog2\n');
        expect(mockLogFn).toHaveBeenCalled();
    });

    it('should throw error if logs length mismatch', () => {
        mockExistsFn.mockReturnValue(true);
        mockReadFn.mockReturnValue('log1\nlog2\nlog3');

        expect(() => LogVerifier.verify(['log1'], 'golden.txt'))
            .toThrow(/Log length mismatch/);
    });

    it('should throw error if log content mismatch', () => {
        mockExistsFn.mockReturnValue(true);
        mockReadFn.mockReturnValue('log1\nlog2');

        expect(() => LogVerifier.verify(['log1', 'log3'], 'golden.txt'))
            .toThrow(/Log mismatch at line 2/);
    });

    it('should pass if logs match exactly', () => {
        mockExistsFn.mockReturnValue(true);
        mockReadFn.mockReturnValue('log1\nlog2');

        expect(() => LogVerifier.verify(['log1', 'log2'], 'golden.txt'))
            .not.toThrow();
    });
});
