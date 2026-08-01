'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService, RecruiterProfile } from '../../../services/adminService';
import { Plus, Search, Edit2, Ban, Trash2, Building } from 'lucide-react';
import Modal from '../../../components/Modal';
import { toast } from 'sonner';

/**
 * Recruiters Page — Admin view & management of recruiter profiles.
 * Features: Live search, Add Recruiter modal, Edit recruiter & company info,
 * Block/Unblock toggle, and Delete action.
 */
export default function RecruitersPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingRecruiter, setEditingRecruiter] = useState<RecruiterProfile | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  // Form states
  const [addForm, setAddForm] = useState({ phoneNumber: '', name: '', company: '', designation: '' });
  const [editForm, setEditForm] = useState({ name: '', company: '', designation: '' });

  // Fetch recruiters
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-recruiters'],
    queryFn: async () => {
      const res = await adminService.getRecruiters(1, 100);
      return res.data as RecruiterProfile[];
    },
  });

  // Mutations
  const addMutation = useMutation({
    mutationFn: async (payload: typeof addForm) => adminService.createRecruiter(payload),
    onSuccess: () => {
      toast.success('Recruiter created successfully!');
      setIsAddOpen(false);
      setAddForm({ phoneNumber: '', name: '', company: '', designation: '' });
      queryClient.invalidateQueries({ queryKey: ['admin-recruiters'] });
    },
    onError: (err: unknown) => {
      const errorMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to create recruiter';
      toast.error(errorMsg);
    },
  });

  const editMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: typeof editForm }) =>
      adminService.updateRecruiter(id, payload),
    onSuccess: () => {
      toast.success('Recruiter details updated successfully!');
      setEditingRecruiter(null);
      queryClient.invalidateQueries({ queryKey: ['admin-recruiters'] });
    },
    onError: () => toast.error('Failed to update recruiter'),
  });

  const statusMutation = useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: 'active' | 'blocked' }) =>
      adminService.updateUserStatus(userId, status),
    onSuccess: (_, variables) => {
      toast.success(`User ${variables.status === 'blocked' ? 'blocked' : 'unblocked'} successfully!`);
      queryClient.invalidateQueries({ queryKey: ['admin-recruiters'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: () => toast.error('Failed to update status'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (userId: string) => adminService.deleteUser(userId),
    onSuccess: () => {
      toast.success('Recruiter account deleted!');
      setDeletingUserId(null);
      queryClient.invalidateQueries({ queryKey: ['admin-recruiters'] });
    },
    onError: () => toast.error('Failed to delete recruiter'),
  });

  // Filter recruiters
  const filteredRecruiters = (data || []).filter((rec) => {
    return (
      rec.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rec.designation && rec.designation.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  return (
    <div>
      {/* ─── Header & Primary Action ─── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 className="page-title" style={{ margin: '0 0 4px' }}>Recruiter Management</h1>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
            Manage recruiters, company information, manual onboarding, and account status.
          </p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: '#3b82f6', color: '#ffffff', border: 'none',
            padding: '10px 18px', borderRadius: 8, fontSize: '0.875rem',
            fontWeight: 600, cursor: 'pointer', transition: 'background 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#2563eb')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#3b82f6')}
        >
          <Plus size={18} />
          Add Recruiter
        </button>
      </div>

      {/* ─── Search Bar ─── */}
      <div style={{
        background: '#ffffff', borderRadius: 8, padding: '16px 20px',
        border: '1px solid #e2e8f0', marginBottom: 24,
      }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: 12 }} />
          <input
            type="text"
            placeholder="Search by recruiter name, company name, or designation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%', padding: '10px 14px 10px 40px',
              borderRadius: 6, border: '1px solid #e2e8f0',
              fontSize: '0.875rem', outline: 'none', background: '#f8fafc',
            }}
          />
        </div>
      </div>

      {/* ─── Recruiters Data Table ─── */}
      {isLoading ? (
        <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Loading recruiters...</p>
      ) : error ? (
        <p style={{ color: '#ef4444', fontSize: '0.875rem' }}>Failed to load recruiters. Make sure you are logged in as admin.</p>
      ) : filteredRecruiters.length > 0 ? (
        <table className="data-table">
          <thead>
            <tr>
              <th>Recruiter Name</th>
              <th>Company</th>
              <th>Designation</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecruiters.map((recruiter) => (
              <tr key={recruiter.id}>
                <td style={{ fontWeight: 600, color: '#1e293b' }}>{recruiter.name}</td>
                <td>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 500, color: '#0f172a' }}>
                    <Building size={14} color="#3b82f6" />
                    {recruiter.company}
                  </span>
                </td>
                <td>{recruiter.designation || '—'}</td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                    {/* Edit Button */}
                    <button
                      title="Edit Recruiter & Company Info"
                      onClick={() => {
                        setEditingRecruiter(recruiter);
                        setEditForm({
                          name: recruiter.name,
                          company: recruiter.company,
                          designation: recruiter.designation || '',
                        });
                      }}
                      style={{
                        padding: 6, background: '#f1f5f9', border: 'none',
                        borderRadius: 4, cursor: 'pointer', color: '#475569',
                      }}
                    >
                      <Edit2 size={15} />
                    </button>

                    {/* Block / Unblock Toggle */}
                    <button
                      title="Block / Unblock Recruiter"
                      onClick={() => statusMutation.mutate({ userId: recruiter.userId, status: 'blocked' })}
                      style={{
                        padding: 6, background: '#fef2f2', border: 'none',
                        borderRadius: 4, cursor: 'pointer', color: '#ef4444',
                      }}
                    >
                      <Ban size={15} />
                    </button>

                    {/* Delete Button */}
                    <button
                      title="Delete Recruiter Account"
                      onClick={() => setDeletingUserId(recruiter.userId)}
                      style={{
                        padding: 6, background: '#fef2f2', border: 'none',
                        borderRadius: 4, cursor: 'pointer', color: '#dc2626',
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div style={{
          background: '#ffffff', borderRadius: 8, padding: '40px 24px',
          border: '1px solid #e2e8f0', textAlign: 'center',
        }}>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>No recruiters match your search criteria</p>
        </div>
      )}

      {/* ─── Add Recruiter Modal ─── */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add New Recruiter">
        <form onSubmit={(e) => { e.preventDefault(); addMutation.mutate(addForm); }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#1e293b', marginBottom: 6 }}>
              Phone Number *
            </label>
            <input
              type="text" required placeholder="+919988776655"
              value={addForm.phoneNumber}
              onChange={(e) => setAddForm({ ...addForm, phoneNumber: e.target.value })}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid #e2e8f0', outline: 'none' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#1e293b', marginBottom: 6 }}>
              Recruiter Name *
            </label>
            <input
              type="text" required placeholder="Rahul Sharma"
              value={addForm.name}
              onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid #e2e8f0', outline: 'none' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#1e293b', marginBottom: 6 }}>
              Company Name *
            </label>
            <input
              type="text" required placeholder="Arohar Technologies"
              value={addForm.company}
              onChange={(e) => setAddForm({ ...addForm, company: e.target.value })}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid #e2e8f0', outline: 'none' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#1e293b', marginBottom: 6 }}>
              Designation
            </label>
            <input
              type="text" placeholder="HR Lead"
              value={addForm.designation}
              onChange={(e) => setAddForm({ ...addForm, designation: e.target.value })}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid #e2e8f0', outline: 'none' }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
            <button type="button" onClick={() => setIsAddOpen(false)} style={{ padding: '10px 16px', background: '#f1f5f9', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
            <button type="submit" disabled={addMutation.isPending} style={{ padding: '10px 18px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>Save Recruiter</button>
          </div>
        </form>
      </Modal>

      {/* ─── Edit Recruiter Modal ─── */}
      <Modal isOpen={!!editingRecruiter} onClose={() => setEditingRecruiter(null)} title="Edit Recruiter & Company Details">
        <form onSubmit={(e) => { e.preventDefault(); if (editingRecruiter) editMutation.mutate({ id: editingRecruiter.id, payload: editForm }); }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#1e293b', marginBottom: 6 }}>
              Recruiter Name
            </label>
            <input
              type="text" value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid #e2e8f0', outline: 'none' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#1e293b', marginBottom: 6 }}>
              Company Name
            </label>
            <input
              type="text" value={editForm.company}
              onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid #e2e8f0', outline: 'none' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#1e293b', marginBottom: 6 }}>
              Designation
            </label>
            <input
              type="text" value={editForm.designation}
              onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid #e2e8f0', outline: 'none' }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
            <button type="button" onClick={() => setEditingRecruiter(null)} style={{ padding: '10px 16px', background: '#f1f5f9', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
            <button type="submit" disabled={editMutation.isPending} style={{ padding: '10px 18px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>Update Details</button>
          </div>
        </form>
      </Modal>

      {/* ─── Delete Confirmation Modal ─── */}
      <Modal isOpen={!!deletingUserId} onClose={() => setDeletingUserId(null)} title="Confirm Delete Recruiter">
        <p style={{ fontSize: '0.875rem', color: '#475569', margin: '0 0 20px' }}>
          Are you sure you want to delete this recruiter? This action will soft-delete their account and company profile.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button onClick={() => setDeletingUserId(null)} style={{ padding: '10px 16px', background: '#f1f5f9', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
          <button onClick={() => deletingUserId && deleteMutation.mutate(deletingUserId)} disabled={deleteMutation.isPending} style={{ padding: '10px 18px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>
            {deleteMutation.isPending ? 'Deleting...' : 'Delete Recruiter'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
