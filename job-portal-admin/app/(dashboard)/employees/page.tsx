'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService, EmployeeProfile } from '../../../services/adminService';
import { Plus, Search, Edit2, Ban, CheckCircle, Trash2, Loader2 } from 'lucide-react';
import Modal from '../../../components/Modal';
import { toast } from 'sonner';

/**
 * Employees Page — Admin view & management of all employee profiles.
 * Features: Live search, Status filter, Add Employee modal, Edit details,
 * Block/Unblock toggle, and Delete action.
 */
export default function EmployeesPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'blocked'>('all');

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeProfile | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  // Form states for Add Employee
  const [addForm, setAddForm] = useState({ phoneNumber: '', name: '', skills: '', experience: '' });
  // Form states for Edit Employee
  const [editForm, setEditForm] = useState({ name: '', phone: '', skills: '', experience: '' });

  // Fetch employees
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-employees'],
    queryFn: async () => {
      const res = await adminService.getEmployees(1, 100);
      return res.data as EmployeeProfile[];
    },
  });

  // Mutations
  const addMutation = useMutation({
    mutationFn: async (payload: typeof addForm) => adminService.createEmployee(payload),
    onSuccess: () => {
      toast.success('Employee created successfully!');
      setIsAddOpen(false);
      setAddForm({ phoneNumber: '', name: '', skills: '', experience: '' });
      queryClient.invalidateQueries({ queryKey: ['admin-employees'] });
    },
    onError: (err: unknown) => {
      const errorMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to create employee';
      toast.error(errorMsg);
    },
  });

  const editMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: typeof editForm }) =>
      adminService.updateEmployee(id, payload),
    onSuccess: () => {
      toast.success('Employee updated successfully!');
      setEditingEmployee(null);
      queryClient.invalidateQueries({ queryKey: ['admin-employees'] });
    },
    onError: () => toast.error('Failed to update employee'),
  });

  const statusMutation = useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: 'active' | 'blocked' }) =>
      adminService.updateUserStatus(userId, status),
    onSuccess: (_, variables) => {
      toast.success(`User ${variables.status === 'blocked' ? 'blocked' : 'unblocked'} successfully!`);
      queryClient.invalidateQueries({ queryKey: ['admin-employees'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: () => toast.error('Failed to update status'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (userId: string) => adminService.deleteUser(userId),
    onSuccess: () => {
      toast.success('User deleted successfully!');
      setDeletingUserId(null);
      queryClient.invalidateQueries({ queryKey: ['admin-employees'] });
    },
    onError: () => toast.error('Failed to delete user'),
  });

  // Filter employees
  const filteredEmployees = (data || []).filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.phone && emp.phone.includes(searchTerm)) ||
      (emp.skills && emp.skills.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesSearch;
  });

  return (
    <div>
      {/* ─── Page Title & Primary Action ─── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 className="page-title" style={{ margin: '0 0 4px' }}>Employee Management</h1>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
            View, search, create, edit, block, and manage job seekers and candidates.
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
          Add Employee
        </button>
      </div>

      {/* ─── Search & Filters Bar ─── */}
      <div style={{
        background: '#ffffff', borderRadius: 8, padding: '16px 20px',
        border: '1px solid #e2e8f0', marginBottom: 24,
        display: 'flex', gap: 16, alignItems: 'center',
      }}>
        <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
          <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: 12 }} />
          <input
            type="text"
            placeholder="Search by candidate name, phone number, or skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%', padding: '10px 14px 10px 40px',
              borderRadius: 6, border: '1px solid #e2e8f0',
              fontSize: '0.875rem', outline: 'none', background: '#f8fafc',
            }}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          style={{
            padding: '10px 14px', borderRadius: 6, border: '1px solid #e2e8f0',
            fontSize: '0.875rem', outline: 'none', background: '#ffffff',
            color: '#1e293b', cursor: 'pointer',
          }}
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="blocked">Blocked</option>
        </select>
      </div>

      {/* ─── Employees Data Table ─── */}
      {isLoading ? (
        <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Loading employees...</p>
      ) : error ? (
        <p style={{ color: '#ef4444', fontSize: '0.875rem' }}>Failed to load employees. Make sure you are logged in as admin.</p>
      ) : filteredEmployees.length > 0 ? (
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Skills</th>
              <th>Experience</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map((employee) => (
              <tr key={employee.id}>
                <td style={{ fontWeight: 600, color: '#1e293b' }}>{employee.name}</td>
                <td>{employee.phone || '—'}</td>
                <td>
                  {employee.skills ? (
                    <span style={{ fontSize: '0.8125rem', background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: 4 }}>
                      {employee.skills}
                    </span>
                  ) : '—'}
                </td>
                <td>{employee.experience || '—'}</td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                    {/* Edit Button */}
                    <button
                      title="Edit Profile"
                      onClick={() => {
                        setEditingEmployee(employee);
                        setEditForm({
                          name: employee.name,
                          phone: employee.phone || '',
                          skills: employee.skills || '',
                          experience: employee.experience || '',
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
                      title="Block / Unblock"
                      onClick={() => statusMutation.mutate({ userId: employee.userId, status: 'blocked' })}
                      style={{
                        padding: 6, background: '#fef2f2', border: 'none',
                        borderRadius: 4, cursor: 'pointer', color: '#ef4444',
                      }}
                    >
                      <Ban size={15} />
                    </button>

                    {/* Delete Button */}
                    <button
                      title="Delete User"
                      onClick={() => setDeletingUserId(employee.userId)}
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
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>No employees match your search criteria</p>
        </div>
      )}

      {/* ─── Add Employee Modal ─── */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add New Employee">
        <form onSubmit={(e) => { e.preventDefault(); addMutation.mutate(addForm); }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#1e293b', marginBottom: 6 }}>
              Phone Number *
            </label>
            <input
              type="text" required placeholder="+919876543210"
              value={addForm.phoneNumber}
              onChange={(e) => setAddForm({ ...addForm, phoneNumber: e.target.value })}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid #e2e8f0', outline: 'none' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#1e293b', marginBottom: 6 }}>
              Full Name *
            </label>
            <input
              type="text" required placeholder="Ankit Rawat"
              value={addForm.name}
              onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid #e2e8f0', outline: 'none' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#1e293b', marginBottom: 6 }}>
              Skills (comma separated)
            </label>
            <input
              type="text" placeholder="React, Node.js, MongoDB"
              value={addForm.skills}
              onChange={(e) => setAddForm({ ...addForm, skills: e.target.value })}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid #e2e8f0', outline: 'none' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#1e293b', marginBottom: 6 }}>
              Experience
            </label>
            <input
              type="text" placeholder="2 Years"
              value={addForm.experience}
              onChange={(e) => setAddForm({ ...addForm, experience: e.target.value })}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid #e2e8f0', outline: 'none' }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
            <button
              type="button" onClick={() => setIsAddOpen(false)}
              style={{ padding: '10px 16px', background: '#f1f5f9', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 500 }}
            >
              Cancel
            </button>
            <button
              type="submit" disabled={addMutation.isPending}
              style={{ padding: '10px 18px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}
            >
              {addMutation.isPending ? 'Saving...' : 'Save Employee'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ─── Edit Employee Modal ─── */}
      <Modal isOpen={!!editingEmployee} onClose={() => setEditingEmployee(null)} title="Edit Employee Details">
        <form onSubmit={(e) => { e.preventDefault(); if (editingEmployee) editMutation.mutate({ id: editingEmployee.id, payload: editForm }); }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#1e293b', marginBottom: 6 }}>
              Full Name
            </label>
            <input
              type="text" value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid #e2e8f0', outline: 'none' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#1e293b', marginBottom: 6 }}>
              Phone Number
            </label>
            <input
              type="text" value={editForm.phone}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid #e2e8f0', outline: 'none' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#1e293b', marginBottom: 6 }}>
              Skills
            </label>
            <input
              type="text" value={editForm.skills}
              onChange={(e) => setEditForm({ ...editForm, skills: e.target.value })}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid #e2e8f0', outline: 'none' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#1e293b', marginBottom: 6 }}>
              Experience
            </label>
            <input
              type="text" value={editForm.experience}
              onChange={(e) => setEditForm({ ...editForm, experience: e.target.value })}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid #e2e8f0', outline: 'none' }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
            <button type="button" onClick={() => setEditingEmployee(null)} style={{ padding: '10px 16px', background: '#f1f5f9', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
            <button type="submit" disabled={editMutation.isPending} style={{ padding: '10px 18px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>Update Details</button>
          </div>
        </form>
      </Modal>

      {/* ─── Delete Confirmation Modal ─── */}
      <Modal isOpen={!!deletingUserId} onClose={() => setDeletingUserId(null)} title="Confirm Delete User">
        <p style={{ fontSize: '0.875rem', color: '#475569', margin: '0 0 20px' }}>
          Are you sure you want to delete this user? This action will soft-delete their account and profile.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button onClick={() => setDeletingUserId(null)} style={{ padding: '10px 16px', background: '#f1f5f9', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
          <button onClick={() => deletingUserId && deleteMutation.mutate(deletingUserId)} disabled={deleteMutation.isPending} style={{ padding: '10px 18px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>
            {deleteMutation.isPending ? 'Deleting...' : 'Delete User'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
