import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';
import { Sidebar } from './Sidebar';
import { GrievanceTable } from './GrievanceTable';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Loader2, AlertCircle, CheckCircle2, Clock, XCircle, Settings } from 'lucide-react';

export function AdminDashboard() {
  const [grievances, setGrievances] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const { user, isHOD, isAdmin } = useAuth();
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [grievancesResult, statsResult, departmentsResult] = await Promise.all([
        api.getGrievances({
          priority: priorityFilter !== 'All' ? priorityFilter : undefined,
          status: statusFilter !== 'All' ? statusFilter : undefined,
          department: departmentFilter !== 'All' ? departmentFilter : undefined,
        }),
        api.getStats(),
        api.getDepartments(),
      ]);
      setGrievances(grievancesResult.grievances);
      setStats(statsResult.stats);
      setDepartments(departmentsResult.departments || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [priorityFilter, statusFilter, departmentFilter]);

  // For HOD, set department filter to their department
  useEffect(() => {
    if (isHOD && user?.department) {
      setDepartmentFilter(user.department);
    }
  }, [isHOD, user]);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1>{isHOD ? `Department Grievances - ${user?.department}` : 'All Grievances'}</h1>
              <p className="text-muted-foreground">
                {isHOD ? 'Manage grievances for your department' : 'Monitor and manage all system grievances'}
              </p>
            </div>
            {isAdmin && (
              <Button onClick={() => navigate('/admin/manage')} variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Manage System
              </Button>
            )}
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatsCard
                title="Total"
                value={stats.total || 0}
                icon={<AlertCircle className="h-5 w-5" />}
                color="blue"
              />
              <StatsCard
                title="Pending"
                value={stats.pending || 0}
                icon={<Clock className="h-5 w-5" />}
                color="yellow"
              />
              <StatsCard
                title="In Progress"
                value={stats.inProgress || 0}
                icon={<AlertCircle className="h-5 w-5" />}
                color="orange"
              />
              <StatsCard
                title="Resolved"
                value={stats.resolved || 0}
                icon={<CheckCircle2 className="h-5 w-5" />}
                color="green"
              />
            </div>
          )}

          {/* Filters */}
          <div className="flex gap-4 items-center flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-sm">Priority:</label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm">Status:</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm">Department:</label>
              {isHOD ? (
                <div className="px-3 py-2 bg-primary/10 text-primary border border-primary/20 rounded-md text-sm">
                  {user?.department || 'N/A'} (Your Department)
                </div>
              ) : (
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.name}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          {/* Grievances Table */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : grievances.length === 0 ? (
            <div className="text-center py-12 bg-muted/50 rounded-lg">
              <p className="text-muted-foreground">No grievances found matching your filters.</p>
            </div>
          ) : (
            <GrievanceTable
              grievances={grievances}
              onUpdate={fetchData}
              isAdmin
            />
          )}
        </div>
      </main>
    </div>
  );
}

function StatsCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: 'blue' | 'yellow' | 'orange' | 'green';
}) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    orange: 'bg-orange-100 text-orange-600',
    green: 'bg-green-100 text-green-600',
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <h2 className="mt-2">{value}</h2>
          </div>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colorClasses[color]}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
