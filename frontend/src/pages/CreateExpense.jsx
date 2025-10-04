import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery } from 'react-query';
import { toast } from 'react-toastify';
import { expenseAPI, ocrAPI, companyAPI } from '../services/api';
import Spinner from '../components/Spinner';
import { EXPENSE_CATEGORIES } from '../utils/constants';
import { Upload, X } from 'lucide-react';

const CreateExpense = () => {
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState(null);
  const [scanning, setScanning] = useState(false);
  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
    },
  });

  const { data: currenciesData } = useQuery('currencies', companyAPI.getCurrencies);

  const createMutation = useMutation(expenseAPI.create, {
    onSuccess: () => {
      toast.success('Expense created successfully!');
      navigate('/expenses');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create expense');
    },
  });

  const handleReceiptUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setReceipt(file);

    // Try OCR scan
    try {
      setScanning(true);
      const formData = new FormData();
      formData.append('receipt', file);
      
      const result = await ocrAPI.scanReceipt(formData);
      
      if (result.data) {
        setValue('amount', result.data.amount || '');
        setValue('merchant', result.data.merchant || '');
        setValue('date', result.data.date || '');
        toast.success('Receipt scanned successfully!');
      }
    } catch (error) {
      toast.info('Could not scan receipt automatically. Please enter details manually.');
    } finally {
      setScanning(false);
    }
  };

  const onSubmit = async (data) => {
    const formData = new FormData();
    
    Object.keys(data).forEach(key => {
      formData.append(key, data[key]);
    });

    if (receipt) {
      formData.append('receipt', receipt);
    }

    createMutation.mutate(formData);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Create Expense</h1>
        <p className="text-gray-600 mt-2">Submit a new expense for approval</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="card space-y-6">
        {/* Receipt Upload */}
        <div>
          <label className="input-label">Receipt (Optional)</label>
          <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-400 transition-colors">
            <div className="space-y-2 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500">
                  <span>Upload a receipt</span>
                  <input
                    type="file"
                    className="sr-only"
                    accept="image/*"
                    onChange={handleReceiptUpload}
                  />
                </label>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
              {receipt && (
                <div className="flex items-center justify-center space-x-2 text-sm text-green-600">
                  <span>{receipt.name}</span>
                  <button
                    type="button"
                    onClick={() => setReceipt(null)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
              {scanning && <Spinner size="sm" />}
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="input-label">Date *</label>
            <input
              type="date"
              className="input-field"
              {...register('date', { required: 'Date is required' })}
            />
            {errors.date && (
              <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
            )}
          </div>

          <div>
            <label className="input-label">Category *</label>
            <select
              className="input-field"
              {...register('category', { required: 'Category is required' })}
            >
              <option value="">Select category</option>
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="input-label">Description *</label>
          <textarea
            className="input-field"
            rows="3"
            placeholder="Enter expense description"
            {...register('description', { required: 'Description is required' })}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="input-label">Amount *</label>
            <input
              type="number"
              step="0.01"
              className="input-field"
              placeholder="0.00"
              {...register('amount', {
                required: 'Amount is required',
                min: { value: 0.01, message: 'Amount must be greater than 0' },
              })}
            />
            {errors.amount && (
              <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
            )}
          </div>

          <div>
            <label className="input-label">Currency *</label>
            <select
              className="input-field"
              {...register('currency', { required: 'Currency is required' })}
            >
              <option value="">Select currency</option>
              {currenciesData?.currencies?.map((curr) => (
                <option key={curr.code} value={curr.code}>
                  {curr.code} - {curr.name}
                </option>
              ))}
            </select>
            {errors.currency && (
              <p className="mt-1 text-sm text-red-600">{errors.currency.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="input-label">Merchant</label>
          <input
            type="text"
            className="input-field"
            placeholder="Merchant name"
            {...register('merchant')}
          />
        </div>

        <div>
          <label className="input-label">Notes</label>
          <textarea
            className="input-field"
            rows="2"
            placeholder="Additional notes (optional)"
            {...register('notes')}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4 pt-4 border-t">
          <button
            type="button"
            onClick={() => navigate('/expenses')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createMutation.isLoading}
            className="btn-primary"
          >
            {createMutation.isLoading ? <Spinner size="sm" /> : 'Submit Expense'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateExpense;
