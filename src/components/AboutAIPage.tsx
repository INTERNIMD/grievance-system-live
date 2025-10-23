import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Brain, Zap, Target, Shield, ArrowLeft } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function AboutAIPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      <div className="container mx-auto px-4 py-12">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <div className="max-w-4xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <Brain className="h-8 w-8 text-primary" />
            </div>
            <h1>How the AI System Works</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our AI-powered grievance classification system uses advanced machine learning 
              to automatically categorize and prioritize every submission.
            </p>
          </div>

          {/* Hero Image */}
          <div className="rounded-lg overflow-hidden shadow-xl">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1617791160536-598cf32026fb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpZmljaWFsJTIwaW50ZWxsaWdlbmNlJTIwYnJhaW58ZW58MXx8fHwxNzYxMTU2MjA4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="AI Brain"
              className="w-full h-auto"
            />
          </div>

          {/* How It Works */}
          <div className="space-y-6">
            <h2>The Classification Process</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <ProcessCard
                icon={<Zap className="h-6 w-6 text-primary" />}
                title="1. Real-time Analysis"
                description="When you submit a grievance, our AI instantly analyzes the title and description using natural language processing."
              />
              <ProcessCard
                icon={<Target className="h-6 w-6 text-primary" />}
                title="2. Smart Classification"
                description="The system identifies key patterns and keywords to determine the appropriate department and urgency level."
              />
              <ProcessCard
                icon={<Shield className="h-6 w-6 text-primary" />}
                title="3. Confidence Scoring"
                description="Each classification comes with a confidence score, ensuring transparency in the AI's decision-making."
              />
              <ProcessCard
                icon={<Brain className="h-6 w-6 text-primary" />}
                title="4. Continuous Learning"
                description="The system learns from administrator feedback to improve accuracy over time."
              />
            </div>
          </div>

          {/* AI Model Details */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3>AI Model Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Model Provider</span>
                  <span>Ollama (LLaMA2/Mistral)</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Classification Categories</span>
                  <span>Department & Priority</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Supported Departments</span>
                  <span>8 categories</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Priority Levels</span>
                  <span>High, Medium, Low</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Departments */}
          <div className="space-y-4">
            <h3>Supported Departments</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                'Admin',
                'Exam Cell',
                'Library',
                'Hostel',
                'IT Support',
                'Transport',
                'Academic Affairs',
                'Other',
              ].map((dept) => (
                <div
                  key={dept}
                  className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-center text-sm"
                >
                  {dept}
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center space-y-4 pt-8">
            <h3>Ready to experience AI-powered grievance management?</h3>
            <Button
              onClick={() => navigate('/submit')}
              className="bg-primary hover:bg-primary/90"
              size="lg"
            >
              Submit Your First Grievance
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProcessCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card>
      <CardContent className="p-6 space-y-3">
        <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center">
          {icon}
        </div>
        <h3 className="text-base">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
