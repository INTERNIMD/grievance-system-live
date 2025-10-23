import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Card, CardHeader, CardContent, CardFooter } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { FileText, Loader2, CheckCircle, ArrowLeft, Home, Sparkles } from 'lucide-react';

export function SubmitGrievancePage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [manualDepartment, setManualDepartment] = useState('');
  const [useAI, setUseAI] = useState(true);
  const [departments, setDepartments] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [classification, setClassification] = useState<any>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const result = await api.getDepartments();
      setDepartments(result.departments || []);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    // Validate manual department selection
    if (!useAI && !manualDepartment) {
      setError('Please select a department or enable AI classification');
      setLoading(false);
      return;
    }

    try {
      const result = await api.submitGrievance({
        title,
        description,
        isAnonymous,
        manualDepartment: useAI ? undefined : manualDepartment,
      });

      setSuccess(true);
      setClassification(result.classification);
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    } catch (err: any) {
      console.error('Submit grievance error:', err);
      setError(err.message || 'Failed to submit grievance. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10 py-12 px-4">
      {/* Header Navigation */}
      <div className="container mx-auto max-w-2xl mb-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <Button
            variant="ghost"
            onClick={handleGoHome}
            className="gap-2"
          >
            <Home className="h-4 w-4" />
            Home
          </Button>
        </div>
      </div>

      <div className="container mx-auto max-w-2xl">
        <Card>
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2>Submit Grievance</h2>
                <p className="text-muted-foreground">
                  Submit your complaint with AI or manual classification
                </p>
              </div>
            </div>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {success && classification && (
                <Alert className="border-green-500 bg-green-50 text-green-900">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <p>Grievance submitted successfully!</p>
                      <p className="text-sm">
                        <strong>Department:</strong> {classification.department} |{' '}
                        <strong>Priority:</strong> {classification.priority}
                      </p>
                      <p className="text-sm italic">{classification.reason}</p>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="Enter a brief title for your grievance"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  disabled={loading || success}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your grievance in detail. Include relevant information such as dates, locations, and people involved."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  disabled={loading || success}
                  rows={8}
                  className="resize-none"
                />
              </div>

              {/* Department Selection */}
              <div className="space-y-4 border border-border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Department Classification</Label>
                    <p className="text-sm text-muted-foreground">
                      {useAI ? 'AI will classify automatically' : 'Choose department manually'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Manual</span>
                    <Switch
                      id="use-ai"
                      checked={useAI}
                      onCheckedChange={(checked) => {
                        setUseAI(checked);
                        if (checked) setManualDepartment('');
                      }}
                      disabled={loading || success}
                    />
                    <span className="text-sm text-muted-foreground">AI</span>
                  </div>
                </div>

                {useAI ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
                    <Sparkles className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-blue-900">
                      <strong>AI Classification Enabled:</strong> Our AI will automatically analyze 
                      your grievance and assign it to the most appropriate department with a priority level.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="department">Select Department *</Label>
                    <Select
                      value={manualDepartment}
                      onValueChange={setManualDepartment}
                      disabled={loading || success}
                    >
                      <SelectTrigger id="department">
                        <SelectValue placeholder="Choose a department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.name}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Manually select the department that should handle your grievance
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="space-y-0.5">
                  <Label htmlFor="anonymous">Submit Anonymously</Label>
                  <p className="text-sm text-muted-foreground">
                    Your identity will not be revealed to anyone
                  </p>
                </div>
                <Switch
                  id="anonymous"
                  checked={isAnonymous}
                  onCheckedChange={setIsAnonymous}
                  disabled={loading || success}
                />
              </div>
            </CardContent>
            <CardFooter className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90 flex-1"
                disabled={loading || success || (!useAI && !manualDepartment)}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : success ? (
                  'Submitted!'
                ) : (
                  'Submit Grievance'
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
