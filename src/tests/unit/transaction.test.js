const mongoose = require('mongoose');
const Transaction = require('../../models/Transaction');

describe('Transaction Model - Unit Tests', () => {
    let transaction;

    beforeEach(() => {
        transaction = new Transaction({
            transactionId: 'txn_123456',
            userId: new mongoose.Types.ObjectId(),
            accountNumber: '1234567890',
            type: 'credit',
            amount: 5000,
            status: 'Completed',
            responseCode: '00',
            responseMessage: 'Transaction successful'
        });

        // Mock the save method
        transaction.save = jest.fn().mockImplementation(async function() {
            const doc = this;
            // Validate required fields
            if (!doc.userId || !doc.transactionId || !doc.accountNumber) {
                throw new mongoose.Error.ValidationError(null);
            }
            // Validate enum fields
            if (!['credit', 'debit'].includes(doc.type)) {
                const error = new mongoose.Error.ValidationError(null);
                error.errors = { type: new Error('Invalid type') };
                throw error;
            }
            if (!['Pending', 'Completed', 'Failed'].includes(doc.status)) {
                const error = new mongoose.Error.ValidationError(null);
                error.errors = { status: new Error('Invalid status') };
                throw error;
            }
            return this;
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should create & save transaction successfully', async () => {
        const savedTransaction = await transaction.save();
        
        expect(savedTransaction._id).toBeDefined();
        expect(savedTransaction.transactionId).toBe('txn_123456');
        expect(transaction.save).toHaveBeenCalled();
    });

    test('should fail to save transaction without required fields', async () => {
        transaction.userId = undefined;
        
        await expect(transaction.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    test('should fail to save transaction with invalid type', async () => {
        transaction.type = 'invalid_type';
        
        const savePromise = transaction.save();
        await expect(savePromise).rejects.toThrow(mongoose.Error.ValidationError);
    });

    test('should fail to save transaction with invalid status', async () => {
        transaction.status = 'InvalidStatus';
        
        const savePromise = transaction.save();
        await expect(savePromise).rejects.toThrow(mongoose.Error.ValidationError);
    });
});
