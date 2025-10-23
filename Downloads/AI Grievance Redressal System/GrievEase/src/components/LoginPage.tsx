import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardHeader, CardContent, CardFooter } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Lock, GraduationCap, Users, ShieldCheck, ArrowLeft } from 'lucide-react';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      // AuthRedirect will handle navigation
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-4xl space-y-6">
        {/* Back to Home Button */}
        <div className="flex justify-start">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </div>

        {/* Role Info Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="border-primary/20 hover:border-primary/40 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <GraduationCap className="h-5 w-5 text-primary" />
                </div>
                <h4>Students</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Submit and track your grievances
              </p>
            </CardContent>
          </Card>
          <Card className="border-primary/20 hover:border-primary/40 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <h4>Teachers</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Monitor and respond to issues
              </p>
            </CardContent>
          </Card>
          <Card className="border-primary/20 hover:border-primary/40 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                </div>
                <h4>HOD / Admin</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Manage department grievances
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Login Card */}
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <h2>Login to Your Account</h2>
            <p className="text-muted-foreground">
              Enter your credentials to access the system
            </p>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  minLength={6}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
              <p className="text-sm text-center text-muted-foreground">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  className="text-primary hover:underline"
                  disabled={loading}
                >
                  Register here
                </button>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
