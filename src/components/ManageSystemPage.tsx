import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { Sidebar } from './Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Building2, Users, Loader2, Plus, Pencil, Trash2, AlertCircle } from 'lucide-react';

export function ManageSystemPage() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Department modal state
  const [deptModalOpen, setDeptModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<any>(null);
  const [deptName, setDeptName] = useState('');
  const [deptDescription, setDeptDescription] = useState('');
  const [deptLoading, setDeptLoading] = useState(false);

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [departmentsResult, usersResult] = await Promise.all([
        api.getDepartments(),
        api.getUsers(),
      ]);
      setDepartments(departmentsResult.departments || []);
      setUsers(usersResult.users || []);
    } catch (error: any) {
      console.error('Failed to fetch data:', error);
      setError(error.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenDeptModal = (dept?: any) => {
    if (dept) {
      setEditingDept(dept);
      setDeptName(dept.name);
      setDeptDescription(dept.description);
    } else {
      setEditingDept(null);
      setDeptName('');
      setDeptDescription('');
    }
    setDeptModalOpen(true);
  };

  const handleSaveDepartment = async () => {
    setError('');
    setSuccess('');
    setDeptLoading(true);

    try {
      if (editingDept) {
        await api.updateDepartment(editingDept.id, deptName, deptDescription);
        setSuccess('Department updated successfully');
      } else {
        await api.createDepartment(deptName, deptDescription);
        setSuccess('Department created successfully');
      }
      setDeptModalOpen(false);
      fetchData();
    } catch (error: any) {
      setError(error.message || 'Failed to save department');
    } finally {
      setDeptLoading(false);
    }
  };

  const handleDeleteDepartment = async (id: string) => {
    setDeleteLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.deleteDepartment(id);
      setSuccess('Department deleted successfully');
      setDeleteConfirm(null);
      fetchData();
    } catch (error: any) {
      setError(error.message || 'Failed to delete department');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    setDeleteLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.deleteUser(id);
      setSuccess('User deleted successfully');
      setDeleteConfirm(null);
      fetchData();
    } catch (error: any) {
      setError(error.message || 'Failed to delete user');
    } finally {
      setDeleteLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const variants: any = {
      admin: 'destructive',
      hod: 'default',
      teacher: 'secondary',
      student: 'outline',
    };
    return <Badge variant={variants[role] || 'outline'}>{role.toUpperCase()}</Badge>;
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div>
            <h1>System Management</h1>
            <p className="text-muted-foreground">
              Manage departments and user accounts
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-500 bg-green-50 text-green-900">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="departments" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="departments">Departments</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
            </TabsList>

            <TabsContent value="departments" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3>Departments</h3>
                <Button onClick={() => handleOpenDeptModal()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Department
                </Button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : departments.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No departments yet</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {departments.map((dept) => (
                    <Card key={dept.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Building2 className="h-5 w-5 text-primary" />
                              <h3>{dept.name}</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {dept.description}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              Created: {new Date(dept.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenDeptModal(dept)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setDeleteConfirm({ type: 'department', item: dept })}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="users" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3>Users</h3>
                <p className="text-sm text-muted-foreground">
                  {users.length} total users
                </p>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : users.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No users yet</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {users.map((user) => (
                    <Card key={user.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3>{user.name}</h3>
                              {getRoleBadge(user.role)}
                            </div>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                            {user.department && (
                              <p className="text-sm text-muted-foreground mt-1">
                                Department: {user.department}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-2">
                              Joined: {new Date(user.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setDeleteConfirm({ type: 'user', item: user })}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Department Modal */}
      <Dialog open={deptModalOpen} onOpenChange={setDeptModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingDept ? 'Edit Department' : 'Add New Department'}
            </DialogTitle>
            <DialogDescription>
              The AI will use the department description to classify grievances appropriately.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="deptName">Department Name</Label>
              <Input
                id="deptName"
                value={deptName}
                onChange={(e) => setDeptName(e.target.value)}
                placeholder="e.g., IT Section"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deptDescription">Description (for AI Classification)</Label>
              <Textarea
                id="deptDescription"
                value={deptDescription}
                onChange={(e) => setDeptDescription(e.target.value)}
                placeholder="Describe what this department handles. The AI uses this to classify grievances."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeptModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveDepartment} disabled={deptLoading || !deptName || !deptDescription}>
              {deptLoading ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent aria-describedby={deleteConfirm ? "delete-description" : undefined}>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            {deleteConfirm && (
              <DialogDescription id="delete-description">
                {deleteConfirm.type === 'department' 
                  ? `Are you sure you want to delete the department "${deleteConfirm.item.name}"? This action cannot be undone.`
                  : `Are you sure you want to delete the user "${deleteConfirm.item.name}"? This action cannot be undone.`
                }
              </DialogDescription>
            )}
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteConfirm.type === 'department') {
                  handleDeleteDepartment(deleteConfirm.item.id);
                } else {
                  handleDeleteUser(deleteConfirm.item.id);
                }
              }}
              disabled={deleteLoading}
            >
              {deleteLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
