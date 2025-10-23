import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Brain, Lock, Bell, ArrowRight, Menu } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSubmitClick = () => {
    if (user) {
      navigate('/submit');
    } else {
      navigate('/register');
    }
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleDashboardClick = () => {
    if (user?.role === 'admin' || user?.role === 'hod') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      {/* Navigation Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-primary">AI Grievance System</h3>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Button
                  onClick={handleDashboardClick}
                  variant="ghost"
                >
                  Dashboard
                </Button>
                <Button
                  onClick={handleSubmitClick}
                  className="bg-primary hover:bg-primary/90"
                >
                  Submit Grievance
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={handleLoginClick}
                  variant="ghost"
                >
                  Login
                </Button>
                <Button
                  onClick={() => navigate('/register')}
                  className="bg-primary hover:bg-primary/90"
                >
                  Register
                </Button>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-balance">
              Intelligent AI Grievance Redressal System
            </h1>
            <p className="text-muted-foreground max-w-xl">
              Submit and track college grievances intelligently — with AI-based classification, 
              anonymous options, and real-time updates.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                onClick={handleSubmitClick}
                className="bg-primary hover:bg-primary/90"
                size="lg"
              >
                Submit Grievance
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              {!user && (
                <Button
                  onClick={handleLoginClick}
                  variant="outline"
                  size="lg"
                >
                  Login
                </Button>
              )}
            </div>
          </div>
          <div className="relative">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1758270704787-615782711641?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50cyUyMGRpc2N1c3NpbmclMjBjb2xsZWdlfGVufDF8fHx8MTc2MTIwOTYxOHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Students discussing"
              className="rounded-lg shadow-2xl w-full h-auto"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Brain className="h-8 w-8 text-primary" />}
            title="AI Priority Classification"
            description="Automatically assigns department and priority using advanced machine learning algorithms."
          />
          <FeatureCard
            icon={<Lock className="h-8 w-8 text-primary" />}
            title="Anonymous Submission"
            description="Post grievances securely without revealing your identity for sensitive matters."
          />
          <FeatureCard
            icon={<Bell className="h-8 w-8 text-primary" />}
            title="Instant Notifications"
            description="High-priority issues alert administrators immediately for faster resolution."
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-primary/10 rounded-xl p-12 text-center space-y-6">
          <h2>Ready to submit your grievance?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our AI system will automatically classify and route your issue to the appropriate department.
          </p>
          <Button
            onClick={handleSubmitClick}
            className="bg-primary hover:bg-primary/90"
            size="lg"
          >
            Get Started Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-border">
        <div className="text-center text-sm text-muted-foreground">
          <p>&copy; 2025 AI Grievance Redressal System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-card rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow border border-border">
      <div className="mb-4">{icon}</div>
      <h3 className="mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
