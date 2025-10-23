import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Sidebar } from './Sidebar';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Loader2, Activity } from 'lucide-react';

export function AILogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const result = await api.getAILogs();
        setLogs(result.logs);
      } catch (error) {
        console.error('Failed to fetch AI logs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1>AI Classification Logs</h1>
              <p className="text-muted-foreground">
                View detailed logs of AI grievance classifications
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : logs.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">No AI logs available yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <Card key={log.grievanceId}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs text-muted-foreground">
                            {log.grievanceId?.slice(0, 12)}...
                          </span>
                          <Badge variant="outline">{log.classification?.department}</Badge>
                          <Badge
                            className={
                              log.classification?.priority === 'High'
                                ? 'bg-red-100 text-red-800'
                                : log.classification?.priority === 'Medium'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                            }
                          >
                            {log.classification?.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground italic">
                          {log.classification?.reason}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Confidence: {((log.classification?.confidence || 0) * 100).toFixed(0)}%
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {new Date(log.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
