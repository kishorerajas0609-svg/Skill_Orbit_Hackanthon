import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import {
  Users,
  Search,
  ArrowLeft,
  ShieldCheck,
  Ban,
  CheckCircle2
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';

export const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data?.users || []);
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
    setUpdatingId(userId);
    try {
      await api.post('/admin/user-status', {
        user_id: userId,
        status: newStatus,
      });
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, status: newStatus } : u))
      );
    } catch (e) {
      // ignore
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = users.filter((u) => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      return u.full_name?.toLowerCase().includes(s) || u.email?.toLowerCase().includes(s);
    }
    return true;
  });

  return (
    <div className="space-y-8">
      <Link to="/admin/dashboard" className="inline-flex items-center gap-1.5 text-xs text-foreground-muted hover:text-foreground">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Admin Console
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">User Management Directory</h1>
          <p className="text-xs text-foreground-muted">
            Manage platform users across Student, Recruiter, Institution, and Academician roles.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-xl border border-border bg-surface px-3 py-2 text-xs text-foreground focus:border-emerald-500 focus:outline-none"
          >
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="recruiter">Recruiters</option>
            <option value="institution">Institutions</option>
            <option value="academician">Academicians</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton className="h-64 rounded-2xl" />
      ) : (
        <Card className="p-0 overflow-hidden border-border bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-elevated border-b border-border text-foreground-muted uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="p-3.5">User</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Joined</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map((u) => (
                  <tr key={u._id} className="hover:bg-surface-elevated/40">
                    <td className="p-3.5">
                      <span className="font-bold text-foreground block">{u.full_name}</span>
                      <span className="text-[11px] text-foreground-muted">{u.email}</span>
                    </td>
                    <td className="p-3.5">
                      <Badge variant="cyan" size="sm" className="capitalize">{u.role}</Badge>
                    </td>
                    <td className="p-3.5">
                      <Badge variant={u.status === 'suspended' ? 'rose' : 'emerald'} size="sm">
                        {u.status || 'active'}
                      </Badge>
                    </td>
                    <td className="p-3.5 text-foreground-muted text-[11px]">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-3.5 text-right">
                      {u.role !== 'admin' && (
                        <Button
                          variant={u.status === 'suspended' ? 'primary' : 'outline'}
                          size="sm"
                          loading={updatingId === u._id}
                          onClick={() => handleToggleStatus(u._id, u.status || 'active')}
                        >
                          {u.status === 'suspended' ? 'Activate Account' : 'Suspend Account'}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
