import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search, Download, Trash2, Edit2, ChevronDown, ChevronUp, Receipt, ZoomIn
} from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { SkeletonRow } from '../components/ui/Spinner';
import { useToast } from '../context/ToastContext';
import { expenseService } from '../services/expenseService';
import type { Expense, ExpenseFilters } from '../types';
import { ExpenseCategory, ExpenseStatus } from '../types';
import { formatCurrency, formatDate, CATEGORY_OPTIONS } from '../utils/formatters';

const STATUS_OPTIONS = [
  { value: ExpenseStatus.PENDING, label: 'Pending' },
  { value: ExpenseStatus.CONFIRMED, label: 'Confirmed' },
  { value: ExpenseStatus.REJECTED, label: 'Rejected' },
];

export function ExpensesPage() {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);
  const [editTarget, setEditTarget] = useState<Expense | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [filters, setFilters] = useState<ExpenseFilters>(() => {
    const cat = searchParams.get('category') as ExpenseCategory | null;
    return { page: 1, limit: 20, ...(cat ? { category: cat } : {}) };
  });
  const [search, setSearch] = useState('');

  const load = useCallback(async (f: ExpenseFilters) => {
    setLoading(true);
    try {
      const res = await expenseService.getAll(f);
      setExpenses(res.data);
      setTotal(res.total);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load expenses');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(filters); }, [filters, load]);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => {
      setFilters((f) => ({ ...f, search: search || undefined, page: 1 }));
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await expenseService.remove(deleteTarget.id);
      toast.success('Expense deleted');
      setDeleteTarget(null);
      load(filters);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  const totalPages = Math.ceil(total / (filters.limit ?? 20));
  const currentPage = filters.page ?? 1;

  return (
    <div>
      <Header
        title="Expenses"
        subtitle={`${total} total`}
        actions={
          <Button
            variant="secondary"
            size="sm"
            icon={<Download size={14} />}
            onClick={() => expenseService.exportCsv(filters)}
          >
            Export CSV
          </Button>
        }
      />

      {/* Filter bar */}
      <Card className="mb-5">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search merchant..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2CA01C] focus:border-[#2CA01C]"
            />
          </div>
          <Select
            placeholder="All categories"
            options={CATEGORY_OPTIONS}
            value={filters.category ?? ''}
            onChange={(e) =>
              setFilters((f) => ({ ...f, category: (e.target.value as ExpenseCategory) || undefined, page: 1 }))
            }
            className="w-40"
          />
          <Select
            placeholder="All statuses"
            options={STATUS_OPTIONS}
            value={filters.status ?? ''}
            onChange={(e) =>
              setFilters((f) => ({ ...f, status: (e.target.value as ExpenseStatus) || undefined, page: 1 }))
            }
            className="w-36"
          />
          <Input
            type="date"
            value={filters.startDate ?? ''}
            onChange={(e) => setFilters((f) => ({ ...f, startDate: e.target.value || undefined, page: 1 }))}
            className="w-36"
          />
          <Input
            type="date"
            value={filters.endDate ?? ''}
            onChange={(e) => setFilters((f) => ({ ...f, endDate: e.target.value || undefined, page: 1 }))}
            className="w-36"
          />
          {(filters.category || filters.status || filters.startDate || filters.endDate || search) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setSearch(''); setFilters({ page: 1, limit: 20 }); }}
            >
              Clear
            </Button>
          )}
        </div>
      </Card>

      {/* Table */}
      <Card padding={false}>
        {loading ? (
          <div className="px-5 py-2 divide-y divide-gray-100">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)}
          </div>
        ) : expenses.length === 0 ? (
          <EmptyState
            icon={<Receipt size={48} />}
            title="No expenses found"
            description="Upload a receipt or adjust your filters."
          />
        ) : (
          <>
            {/* Header row */}
            <div className="grid grid-cols-[1fr_2fr_1fr_1fr_1fr_80px] gap-4 px-5 py-3 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <span>Date</span>
              <span>Merchant</span>
              <span>Category</span>
              <span>Amount</span>
              <span>Status</span>
              <span />
            </div>
            <div className="divide-y divide-gray-100">
              {expenses.map((expense) => (
                <React.Fragment key={expense.id}>
                  <div
                    className="grid grid-cols-[1fr_2fr_1fr_1fr_1fr_80px] gap-4 px-5 py-3.5 items-center hover:bg-gray-50 cursor-pointer"
                    onClick={() => setExpandedId(expandedId === expense.id ? null : expense.id)}
                  >
                    <span className="text-sm text-gray-600">{formatDate(expense.date)}</span>
                    <span className="text-sm font-medium text-gray-900 truncate">{expense.merchant}</span>
                    <Badge category={expense.category} />
                    <span className="text-sm font-semibold text-gray-900">
                      {formatCurrency(expense.amount, expense.currency)}
                    </span>
                    <Badge status={expense.status} />
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setEditTarget(expense)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-[#2CA01C] hover:bg-[#e8f5e9] transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(expense)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                      {expandedId === expense.id ? (
                        <ChevronUp size={14} className="text-gray-400" />
                      ) : (
                        <ChevronDown size={14} className="text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded row */}
                  {expandedId === expense.id && (
                    <div className="px-5 pb-4 bg-gray-50 border-b border-gray-100">
                      <div className="grid grid-cols-2 gap-6 pt-3">
                        <div className="space-y-2 text-sm">
                          {expense.description && (
                            <div><span className="text-gray-500">Note: </span>{expense.description}</div>
                          )}
                          {expense.aiConfidence != null && (
                            <div><span className="text-gray-500">AI Confidence: </span>{Math.round(expense.aiConfidence * 100)}%</div>
                          )}
                          {expense.userCorrected && (
                            <div className="text-yellow-600 text-xs">User corrected AI extraction</div>
                          )}
                        </div>
                        {expense.receiptImagePath && (
                          <div
                            className="relative group cursor-pointer"
                            onClick={() => setImagePreview(`/uploads/${expense.receiptImagePath!.split('/').pop()}`)}
                          >
                            <img
                              src={`/uploads/${expense.receiptImagePath.split('/').pop()}`}
                              alt="Receipt"
                              className="max-h-40 rounded-lg border border-gray-200 object-contain"
                            />
                            <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/0 group-hover:bg-black/20 transition-colors">
                              <ZoomIn size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
                <span className="text-sm text-gray-500">
                  Page {currentPage} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) - 1 }))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) + 1 }))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Delete confirmation modal */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Expense" size="sm">
        <p className="text-sm text-gray-600 mb-4">
          Are you sure you want to delete the expense from{' '}
          <strong>{deleteTarget?.merchant}</strong> ({formatCurrency(deleteTarget?.amount ?? 0)})?
          This cannot be undone.
        </p>
        <div className="flex gap-3">
          <Button variant="danger" onClick={handleDelete} className="flex-1">Delete</Button>
          <Button variant="secondary" onClick={() => setDeleteTarget(null)} className="flex-1">Cancel</Button>
        </div>
      </Modal>

      {/* Edit modal */}
      {editTarget && (
        <EditExpenseModal
          expense={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={() => { setEditTarget(null); load(filters); }}
        />
      )}

      {/* Full-size receipt image viewer */}
      <Modal open={!!imagePreview} onClose={() => setImagePreview(null)} title="Receipt Image" size="lg">
        {imagePreview && (
          <img src={imagePreview} alt="Receipt full size" className="w-full rounded-lg object-contain max-h-[70vh]" />
        )}
      </Modal>
    </div>
  );
}

function EditExpenseModal({
  expense,
  onClose,
  onSaved,
}: {
  expense: Expense;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    merchant: expense.merchant,
    amount: String(expense.amount),
    currency: expense.currency,
    category: expense.category,
    date: expense.date,
    description: expense.description ?? '',
    status: expense.status,
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      await expenseService.update(expense.id, {
        ...form,
        amount: parseFloat(form.amount),
      });
      toast.success('Expense updated');
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} title="Edit Expense" size="md">
      <div className="space-y-4">
        <Input label="Merchant" value={form.merchant} onChange={(e) => setForm((f) => ({ ...f, merchant: e.target.value }))} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Amount" type="number" step="0.01" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} />
          <Input label="Currency" value={form.currency} onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))} />
        </div>
        <Select
          label="Category"
          value={form.category}
          options={CATEGORY_OPTIONS}
          onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as ExpenseCategory }))}
        />
        <Input label="Date" type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
        <Input label="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
        <Select
          label="Status"
          value={form.status}
          options={STATUS_OPTIONS}
          onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as ExpenseStatus }))}
        />
        <div className="flex gap-3 pt-2">
          <Button onClick={handleSave} loading={saving} className="flex-1">Save Changes</Button>
          <Button variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
        </div>
      </div>
    </Modal>
  );
}
