import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, FileImage, CheckCircle, AlertTriangle, X, Edit2 } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge, ConfidenceBadge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Spinner } from '../components/ui/Spinner';
import { useToast } from '../context/ToastContext';
import { receiptService } from '../services/receiptService';
import { expenseService } from '../services/expenseService';
import type { ScanReceiptResponse, Expense } from '../types';
import { ExpenseCategory, ExpenseStatus } from '../types';
import { formatCurrency, formatDate, CATEGORY_OPTIONS } from '../utils/formatters';
import { usePageTitle } from '../hooks/usePageTitle';

type UploadState = 'idle' | 'uploading' | 'review' | 'manual' | 'done';

export function UploadPage() {
  usePageTitle('Upload Receipt');
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [preview, setPreview] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanReceiptResponse | null>(null);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [, setPendingFile] = useState<File | null>(null);

  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);

  const loadRecent = useCallback(async () => {
    try {
      const res = await expenseService.getAll({ page: 1, limit: 3, status: ExpenseStatus.CONFIRMED });
      setRecentExpenses(res.data);
    } catch { /* non-critical */ }
  }, []);

  useEffect(() => { loadRecent(); }, [loadRecent]);

  // Editable form state (mirrors extracted data)
  const [form, setForm] = useState({
    merchant: '',
    amount: '',
    currency: 'USD',
    category: ExpenseCategory.OTHER,
    date: '',
    description: '',
  });

  const processFile = useCallback(async (file: File) => {
    setPreview(URL.createObjectURL(file));
    setUploadState('uploading');
    try {
      const result = await receiptService.scan(file);
      setScanResult(result);
      setForm({
        merchant: result.extraction.merchant,
        amount: String(result.extraction.amount),
        currency: result.extraction.currency,
        category: result.extraction.category,
        date: result.extraction.date,
        description: '',
      });
      if (result.isDuplicate) {
        setShowDuplicateModal(true);
      }
      setUploadState('review');
    } catch (err) {
      toast.error('AI scan failed — enter details manually');
      console.error(err);
      setUploadState('manual');
    }
  }, [toast]);

  const handleFile = useCallback((file: File) => {
    if (!file.type.match(/^image\/(jpeg|png|webp|heic)/)) {
      toast.error('Only JPEG, PNG, WEBP, or HEIC images are supported');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File must be under 10MB');
      return;
    }
    processFile(file);
  }, [processFile, toast]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleConfirm = async () => {
    if (!scanResult) return;
    try {
      await expenseService.update(scanResult.expense.id, {
        merchant: form.merchant,
        amount: parseFloat(form.amount),
        currency: form.currency,
        category: form.category,
        date: form.date,
        description: form.description || undefined,
        status: ExpenseStatus.CONFIRMED,
        userCorrected: isUserCorrected(),
      });
      toast.success('Expense confirmed and saved!');
      setUploadState('done');
      loadRecent();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to confirm expense');
    }
  };

  const handleReject = async () => {
    if (!scanResult) return;
    try {
      await expenseService.update(scanResult.expense.id, { status: ExpenseStatus.REJECTED });
      toast.info('Receipt rejected');
      handleReset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to reject expense');
    }
  };

  const handleManualSave = async () => {
    const amount = parseFloat(form.amount);
    if (!form.merchant || !form.amount || isNaN(amount) || !form.date) {
      toast.error('Merchant, amount, and date are required');
      return;
    }
    try {
      await expenseService.create({
        merchant: form.merchant,
        amount,
        currency: form.currency,
        category: form.category,
        date: form.date,
        description: form.description || undefined,
        status: ExpenseStatus.CONFIRMED,
      });
      toast.success('Expense saved manually!');
      setUploadState('done');
      loadRecent();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save expense');
    }
  };

  const handleReset = () => {
    setUploadState('idle');
    setPreview(null);
    setScanResult(null);
    setPendingFile(null);
    setForm({ merchant: '', amount: '', currency: 'USD', category: ExpenseCategory.OTHER, date: '', description: '' });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const isUserCorrected = () => {
    if (!scanResult) return false;
    const e = scanResult.extraction;
    return (
      form.merchant !== e.merchant ||
      parseFloat(form.amount) !== e.amount ||
      form.category !== e.category ||
      form.date !== e.date
    );
  };

  return (
    <div>
      <Header title="Upload Receipt" subtitle="Scan a receipt to auto-extract expense data" />

      {uploadState === 'idle' && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-16 text-center cursor-pointer transition-colors ${
            dragOver
              ? 'border-[#2CA01C] bg-[#e8f5e9]'
              : 'border-gray-300 hover:border-[#2CA01C] hover:bg-gray-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />
          <Upload size={40} className="mx-auto mb-4 text-gray-400" />
          <p className="text-base font-medium text-gray-700 mb-1">
            {dragOver ? 'Drop your receipt here' : 'Drop receipt here or click to browse'}
          </p>
          <p className="text-sm text-gray-500">JPEG, PNG, WEBP, HEIC · Max 10MB</p>
        </div>
      )}

      {uploadState === 'idle' && recentExpenses.length > 0 && (
        <div className="mt-6">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Recently Confirmed</p>
          <div className="space-y-2">
            {recentExpenses.map((exp) => (
              <div key={exp.id} className="flex items-center justify-between px-4 py-3 bg-white rounded-lg border border-gray-200 text-sm">
                <div className="flex items-center gap-3">
                  <Badge category={exp.category} />
                  <span className="font-medium text-gray-900">{exp.merchant}</span>
                </div>
                <div className="flex items-center gap-4 text-gray-500">
                  <span>{formatDate(exp.date)}</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(exp.amount, exp.currency)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {uploadState === 'uploading' && (
        <Card className="flex flex-col items-center py-16">
          <Spinner size={36} />
          <p className="mt-4 text-base font-medium text-gray-700">Analyzing receipt with AI...</p>
          <p className="text-sm text-gray-500 mt-1">Extracting merchant, amount, date, and category</p>
        </Card>
      )}

      {uploadState === 'manual' && (
        <Card className="max-w-lg mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={18} className="text-yellow-500" />
            <h3 className="text-base font-semibold text-gray-900">AI scan failed — enter details manually</h3>
          </div>
          {preview && (
            <img src={preview} alt="Receipt" className="w-full max-h-48 object-contain rounded-lg border border-gray-200 mb-4" />
          )}
          <div className="space-y-4">
            <Input label="Merchant *" value={form.merchant} onChange={(e) => setForm((f) => ({ ...f, merchant: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Amount *" type="number" step="0.01" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} />
              <Input label="Currency" value={form.currency} onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))} />
            </div>
            <Select label="Category" value={form.category} options={CATEGORY_OPTIONS} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as ExpenseCategory }))} />
            <Input label="Date *" type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
            <Input label="Description (optional)" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Add a note..." />
          </div>
          <div className="flex gap-3 mt-6">
            <Button onClick={handleManualSave} className="flex-1"><CheckCircle size={15} /> Save Expense</Button>
            <Button variant="ghost" onClick={handleReset}>Cancel</Button>
          </div>
        </Card>
      )}

      {(uploadState === 'review' || uploadState === 'done') && scanResult && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: image preview */}
          <Card padding={false} className="overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileImage size={16} className="text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Receipt Image</span>
              </div>
              {uploadState !== 'done' && (
                <button onClick={handleReset} className="text-gray-400 hover:text-gray-600">
                  <X size={16} />
                </button>
              )}
            </div>
            {preview && (
              <img
                src={preview}
                alt="Receipt preview"
                className="w-full object-contain max-h-[500px]"
              />
            )}
            {scanResult.extraction.lineItems.length > 0 && (
              <div className="p-4 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Line Items</p>
                <div className="space-y-1">
                  {scanResult.extraction.lineItems.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.name}</span>
                      <span className="font-medium">{formatCurrency(item.amount, form.currency)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Right: extracted data form */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {uploadState === 'done' ? (
                  <CheckCircle size={18} className="text-[#2CA01C]" />
                ) : (
                  <Edit2 size={18} className="text-gray-500" />
                )}
                <h3 className="text-base font-semibold text-gray-900">
                  {uploadState === 'done' ? 'Expense Confirmed' : 'Review Extracted Data'}
                </h3>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                AI Confidence: <ConfidenceBadge confidence={scanResult.extraction.confidence} />
              </div>
            </div>

            {scanResult.isDuplicate && (
              <div className="mb-4 flex items-start gap-2 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                <AlertTriangle size={16} className="text-yellow-600 mt-0.5 shrink-0" />
                <p className="text-sm text-yellow-800">
                  Possible duplicate detected — a similar expense already exists.
                </p>
              </div>
            )}

            <div className="space-y-4">
              <Input
                label="Merchant"
                value={form.merchant}
                onChange={(e) => setForm((f) => ({ ...f, merchant: e.target.value }))}
                disabled={uploadState === 'done'}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Amount"
                  type="number"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                  disabled={uploadState === 'done'}
                />
                <Input
                  label="Currency"
                  value={form.currency}
                  onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
                  disabled={uploadState === 'done'}
                />
              </div>
              <Select
                label="Category"
                value={form.category}
                options={CATEGORY_OPTIONS}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as ExpenseCategory }))}
                disabled={uploadState === 'done'}
              />
              <Input
                label="Date"
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                disabled={uploadState === 'done'}
              />
              <Input
                label="Description (optional)"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                disabled={uploadState === 'done'}
                placeholder="Add a note..."
              />
            </div>

            {uploadState === 'review' && (
              <div className="flex gap-3 mt-6">
                <Button onClick={handleConfirm} className="flex-1">
                  <CheckCircle size={15} />
                  Confirm
                </Button>
                <Button variant="danger" onClick={handleReject} size="md">
                  Reject
                </Button>
              </div>
            )}

            {uploadState === 'done' && (
              <Button variant="secondary" onClick={handleReset} className="w-full mt-6">
                Upload Another Receipt
              </Button>
            )}
          </Card>
        </div>
      )}

      {/* Duplicate warning modal */}
      <Modal
        open={showDuplicateModal}
        onClose={() => setShowDuplicateModal(false)}
        title="Possible Duplicate"
        size="sm"
      >
        {scanResult?.duplicateMatch && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              An existing expense looks similar to this receipt:
            </p>
            <div className="rounded-lg bg-gray-50 border border-gray-200 p-3 text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-500">Merchant</span>
                <span className="font-medium">{scanResult.duplicateMatch.merchant}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Amount</span>
                <span className="font-medium">{formatCurrency(scanResult.duplicateMatch.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date</span>
                <span className="font-medium">{formatDate(scanResult.duplicateMatch.date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <Badge status={scanResult.duplicateMatch.status} />
              </div>
            </div>
            <p className="text-sm text-gray-600">
              You can still confirm this receipt as a separate expense, or reject it.
            </p>
            <Button onClick={() => setShowDuplicateModal(false)} className="w-full">
              Continue Reviewing
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
