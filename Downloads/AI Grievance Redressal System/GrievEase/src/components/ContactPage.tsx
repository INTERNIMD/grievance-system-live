import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardHeader, CardContent, CardFooter } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

export function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send to an API
    console.log('Contact form submitted:', { name, email, message });
    setSuccess(true);
    setTimeout(() => {
      navigate('/');
    }, 2000);
  };

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

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="space-y-1 text-center">
              <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <h2>Contact Technical Support</h2>
              <p className="text-muted-foreground">
                Have a question or need help? Send us a message and we'll get back to you soon.
              </p>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                {success && (
                  <Alert className="border-green-500 bg-green-50 text-green-900">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Message sent successfully! We'll respond to your email shortly.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="contact-name">Name</Label>
                  <Input
                    id="contact-name"
                    type="text"
                    placeholder="Your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={success}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-email">Email</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    placeholder="your.email@college.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={success}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-message">Message</Label>
                  <Textarea
                    id="contact-message"
                    placeholder="Describe your issue or question in detail..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    disabled={success}
                    rows={6}
                    className="resize-none"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    <strong>Support Hours:</strong> Monday - Friday, 9:00 AM - 5:00 PM<br />
                    <strong>Response Time:</strong> We typically respond within 24 hours
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={success}
                >
                  {success ? 'Message Sent!' : 'Send Message'}
                </Button>
              </CardFooter>
            </form>
          </Card>

          {/* Additional Info */}
          <div className="mt-8 grid md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="mb-2">Technical Issues</h3>
                <p className="text-sm text-muted-foreground">
                  For technical problems with the grievance system, please include your browser 
                  type and any error messages you've seen.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="mb-2">General Inquiries</h3>
                <p className="text-sm text-muted-foreground">
                  For questions about the grievance process or system features, our support 
                  team is here to help.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
