import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { GetStoredJWT } from "../StorageComps/StorageCompOne";
import { BASE_URL, PAGE_ID } from "../../../config";

interface BillData {
    Id?: string | number;
    StudentId?: string | number;
    Title?: string;
    Amount?: number;
    Status?: number;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onCreated?: () => void;
    billData?: BillData | null;
}

export default function SchoolBillModal({ isOpen, onClose, onCreated, billData }: Props) {
    const [studentId, setStudentId] = useState<string>("");
    const [title, setTitle] = useState("");
    const [amount, setAmount] = useState<number>(0);
    const [status, setStatus] = useState<number>(1); // Default to Invoice
    const [students, setStudents] = useState<Array<{ Id: string | number; Title?: string; CourseBatchTitle?: string }>>([]);
    const [submitting, setSubmitting] = useState(false);

    const isEditMode = !!billData?.Id;

    useEffect(() => {
        if (isOpen) {
            fetchStudents();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    useEffect(() => {
        if (billData) {
            setStudentId(String(billData.StudentId || ""));
            setTitle(billData.Title || "");
            setAmount(Number(billData.Amount || 0));
            setStatus(Number(billData.Status ?? 1));
        } else {
            resetForm();
        }
    }, [billData]);

    // Auto-fill title when student is selected
    useEffect(() => {
        if (studentId && students.length > 0) {
            const selectedStudent = students.find(s => String(s.Id) === studentId);
            if (selectedStudent?.CourseBatchTitle && !isEditMode) {
                setTitle(selectedStudent.CourseBatchTitle);
            }
        }
    }, [studentId, students, isEditMode]);

    const token = GetStoredJWT();

    const fetchStudents = async () => {
        try {
            const res = await fetch(`${BASE_URL}/student/api/byPageId/${PAGE_ID}`);
            if (!res.ok) throw new Error(`Failed to fetch students: ${res.status}`);
            const result = await res.json();
            const list = Array.isArray(result) ? result : [];
            setStudents(list);
        } catch (err) {
            console.error("fetchStudents error", err);
            setStudents([]);
        }
    };

    const resetForm = () => {
        setStudentId("");
        setTitle("");
        setAmount(0);
        setStatus(1);
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!studentId) {
            alert("Please select a student.");
            return;
        }
        if (!title.trim()) {
            alert("Please enter a title.");
            return;
        }
        if (amount <= 0) {
            alert("Please enter a valid amount.");
            return;
        }

        try {
            setSubmitting(true);
            const formData = new FormData();
            formData.append("pageId", String(PAGE_ID));
            formData.append("studentId", studentId);
            formData.append("title", title);
            formData.append("amount", String(amount));
            formData.append("status", String(status));

            if (isEditMode) {
                formData.append("id", String(billData?.Id));
            }

            const url = `${BASE_URL}/schoolBill/api`;
            const method = isEditMode ? "PATCH" : "POST";

            const res = await fetch(url, {
                method,
                body: formData,
                headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            });

            if (!res.ok) throw new Error(`Failed to ${isEditMode ? 'update' : 'create'} bill: ${res.status}`);

            // success
            resetForm();
            onClose();
            onCreated && onCreated();
        } catch (err: unknown) {
            console.error(err);
            const msg = err instanceof Error ? err.message : String(err);
            alert(msg || `Failed to ${isEditMode ? 'update' : 'create'} bill`);
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4 overflow-auto" style={{ maxHeight: "90vh" }}>
                <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold">{isEditMode ? 'Edit Bill' : 'Create New Bill'}</h3>
                        <button
                            type="button"
                            onClick={() => { onClose(); resetForm(); }}
                            className="p-2 -mr-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="space-y-5">
                        {/* Student Dropdown */}
                        <div className="md:grid md:grid-cols-[140px_1fr] md:gap-4 md:items-start">
                            <label className="block text-sm font-semibold text-gray-700 md:pt-2.5">Student <span className="text-red-500">*</span></label>
                            <div className="mt-1 md:mt-0 w-full">
                                <select
                                    aria-label="Select student"
                                    value={studentId}
                                    onChange={(e) => setStudentId(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm outline-none"
                                >
                                    <option value="">-- Select Student --</option>
                                    {students.map((s) => (
                                        <option key={s.Id} value={String(s.Id)}>
                                            {s.Title} #{s.Id}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Title */}
                        <div className="md:grid md:grid-cols-[140px_1fr] md:gap-4 md:items-start">
                            <label className="block text-sm font-semibold text-gray-700 md:pt-2.5">Title <span className="text-red-500">*</span></label>
                            <div className="mt-1 md:mt-0 w-full">
                                <input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm outline-none"
                                    placeholder="e.g., Monthly Fee - December 2024"
                                />
                                <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                                    <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                                    Auto-filled from student's course based on selection
                                </p>
                            </div>
                        </div>

                        {/* Amount */}
                        <div className="md:grid md:grid-cols-[140px_1fr] md:gap-4 md:items-start">
                            <label className="block text-sm font-semibold text-gray-700 md:pt-2.5">Amount (MMK) <span className="text-red-500">*</span></label>
                            <div className="mt-1 md:mt-0 w-full">
                                <input
                                    type="number"
                                    min="0"
                                    value={amount}
                                    onChange={(e) => setAmount(Number(e.target.value))}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm outline-none"
                                    placeholder="Enter amount"
                                />
                            </div>
                        </div>

                        {/* Status */}
                        <div className="md:grid md:grid-cols-[140px_1fr] md:gap-4 md:items-start">
                            <label className="block text-sm font-semibold text-gray-700 md:pt-2.5">Status <span className="text-red-500">*</span></label>
                            <div className="mt-1 md:mt-0 w-full">
                                <select
                                    aria-label="Select status"
                                    value={status}
                                    onChange={(e) => setStatus(Number(e.target.value))}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm outline-none"
                                >
                                    <option value={0}>Invalid</option>
                                    <option value={1}>Invoice</option>
                                    <option value={2}>Receipt</option>
                                </select>
                                <div className="text-xs text-gray-500 mt-1.5 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100">
                                    {status === 0 && "This bill is voided or cancelled"}
                                    {status === 1 && "Payment is pending (Invoice)"}
                                    {status === 2 && "Payment has been received (Receipt)"}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 mt-8 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => { onClose(); resetForm(); }}
                            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 hover:text-gray-900 font-semibold transition-all shadow-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-md transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {submitting ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Bill' : 'Create Bill')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
