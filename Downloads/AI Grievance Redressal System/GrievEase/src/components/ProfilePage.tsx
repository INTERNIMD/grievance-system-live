import React from 'react';
import { Sidebar } from './Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { User, Mail, Shield, Building2, GraduationCap, Users, ShieldCheck } from 'lucide-react';

export function ProfilePage() {
  const { user, isAdmin, isHOD, isTeacher, isStudent } = useAuth();

  const getRoleDisplay = () => {
    switch (user?.role) {
      case 'admin': return 'Administrator';
      case 'hod': return 'Head of Department';
      case 'teacher': return 'Teacher';
      case 'student': return 'Student';
      default: return 'User';
    }
  };

  const getRoleIcon = () => {
    switch (user?.role) {
      case 'admin': return <ShieldCheck className="h-8 w-8 text-primary" />;
      case 'hod': return <Building2 className="h-8 w-8 text-primary" />;
      case 'teacher': return <Users className="h-8 w-8 text-primary" />;
      default: return <GraduationCap className="h-8 w-8 text-primary" />;
    }
  };

  const getRoleBadgeVariant = () => {
    switch (user?.role) {
      case 'admin': return 'destructive';
      case 'hod': return 'default';
      default: return 'outline';
    }
  };

  const getAboutYourAccount = () => {
    if (isAdmin) {
      return (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            As an <strong>Administrator</strong>, you have full access to the AI Grievance Redressal System with the following capabilities:
          </p>
          <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
            <li>View and manage all grievances across all departments</li>
            <li>Update grievance status (Pending, In Progress, Resolved, Rejected)</li>
            <li>Add comments and communicate with students</li>
            <li>Access AI classification logs and system analytics</li>
            <li>Monitor system-wide grievance statistics and trends</li>
            <li>Override AI classifications if needed</li>
          </ul>
        </div>
      );
    }

    if (isHOD) {
      return (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            As a <strong>Head of Department ({user?.department})</strong>, you have administrative access to manage grievances within your department:
          </p>
          <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
            <li>View all grievances assigned to the <strong>{user?.department}</strong> department</li>
            <li>Update status and manage grievance resolution workflows</li>
            <li>Add official comments and responses to students</li>
            <li>Access AI classification insights for your department</li>
            <li>Monitor department-specific grievance statistics</li>
            <li>Ensure timely resolution of high-priority issues</li>
          </ul>
        </div>
      );
    }

    if (isTeacher) {
      return (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            As a <strong>Teacher</strong>, you can monitor and respond to student grievances:
          </p>
          <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
            <li>View grievances related to your courses and academic matters</li>
            <li>Track the status of reported issues</li>
            <li>Provide feedback and assistance to students</li>
            <li>Help ensure academic grievances are addressed promptly</li>
          </ul>
        </div>
      );
    }

    // Student (default)
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          As a <strong>Student</strong>, your account allows you to:
        </p>
        <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
          <li>Submit grievances about various college issues and concerns</li>
          <li>Choose to submit grievances anonymously for sensitive matters</li>
          <li>Track the status of your submitted grievances in real-time</li>
          <li>Receive automatic AI-powered classification by department and priority</li>
          <li>Get updates on grievance resolution progress</li>
          <li>View comments and responses from administrators</li>
        </ul>
        <p className="text-sm text-muted-foreground mt-3">
          All submissions are securely stored and processed through our AI-powered classification system 
          to ensure they reach the right department quickly.
        </p>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1>Profile</h1>
            <p className="text-muted-foreground">
              View and manage your account information
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center">
                  {getRoleIcon()}
                </div>
                <div className="flex-1">
                  <h3>{user?.name || 'User'}</h3>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
                <Badge variant={getRoleBadgeVariant() as any} className="ml-auto">
                  {getRoleDisplay()}
                </Badge>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <InfoCard
                  icon={<Mail className="h-5 w-5 text-primary" />}
                  label="Email"
                  value={user?.email || 'Not available'}
                />
                <InfoCard
                  icon={<Shield className="h-5 w-5 text-primary" />}
                  label="Role"
                  value={getRoleDisplay()}
                />
                {user?.department && (
                  <InfoCard
                    icon={<Building2 className="h-5 w-5 text-primary" />}
                    label="Department"
                    value={user.department}
                  />
                )}
              </div>

              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  <strong>Member since:</strong> {new Date().toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>About Your Account</CardTitle>
            </CardHeader>
            <CardContent>
              {getAboutYourAccount()}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 p-4 border border-border rounded-lg">
      <div className="bg-primary/10 w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        <p className="text-sm break-all">{value}</p>
      </div>
    </div>
  );
}
