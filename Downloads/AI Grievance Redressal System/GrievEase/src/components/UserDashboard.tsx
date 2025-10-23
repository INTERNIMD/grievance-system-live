import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { Sidebar } from './Sidebar';
import { GrievanceTable } from './GrievanceTable';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { PlusCircle, Loader2, FileText, Clock, CheckCircle2, XCircle } from 'lucide-react';

export function UserDashboard() {
  const [grievances, setGrievances] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [grievancesResult, statsResult] = await Promise.all([
        api.getGrievances({ userOnly: true }),
        api.getUserStats(),
      ]);
      setGrievances(grievancesResult.grievances);
      setStats(statsResult.stats);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1>My Grievances</h1>
              <p className="text-muted-foreground">
                Track and manage your submitted grievances
              </p>
            </div>
            <Button onClick={() => navigate('/submit')}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Submit New Grievance
            </Button>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatsCard
                title="Total Submitted"
                value={stats.total || 0}
                icon={<FileText className="h-5 w-5" />}
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
                icon={<Clock className="h-5 w-5" />}
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

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : grievances.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="mb-2">No grievances yet</h3>
                <p className="text-muted-foreground mb-4">
                  You haven't submitted any grievances. Start by creating your first one.
                </p>
                <Button onClick={() => navigate('/submit')}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Submit Your First Grievance
                </Button>
              </CardContent>
            </Card>
          ) : (
            <GrievanceTable grievances={grievances} onUpdate={fetchData} />
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
  color: 'blue' | 'yellow' | 'orange' | 'green' | 'red';
}) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    orange: 'bg-orange-100 text-orange-800',
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
  };

  return (
    <Card>
      <CardContent className="p-6">
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
