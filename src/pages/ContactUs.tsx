<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> eb1952c30efaaf4746d887d80d31bdb1ab685cb6
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo.png';
import { useNavigate } from 'react-router-dom';
import { Chat } from '@/components/chat/Chat';
import { MessageCircle, Mail, Home } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ContactUs = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('chat');
  
  // In a real app, you would get this from your authentication context
  const userId = `user-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a2e0a] via-[#0d3d0d] to-[#0a2e0a] p-4">
      <div className="bg-card rounded-lg shadow-2xl p-6 w-full max-w-4xl">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3 space-y-6">
            <div className="flex flex-col items-center text-center">
              <img src={logo} alt="ELYONARIS TEST V1.0" className="h-20 w-20 mb-4" />
              <h1 className="text-2xl font-bold text-foreground">Contact Us</h1>
              <p className="text-muted-foreground mt-2">
                Have a question, need help, or want to report an issue? 
                Our support team is here to assist you.
              </p>
            </div>

            <Tabs 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="w-full"
              defaultValue="chat"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="chat" className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Live Chat
                </TabsTrigger>
                <TabsTrigger value="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Us
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="email" className="mt-4 space-y-4">
                <p className="text-sm text-muted-foreground">
                  Send us an email and we'll get back to you as soon as possible.
                </p>
                
                <div className="space-y-2">
                  <a
                    href="mailto:contact.elyonaris@gmail.com?subject=Exam%20Support%20Request"
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-md font-medium hover:bg-accent/90 transition-colors"
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Mail className="h-4 w-4" />
                    contact.elyonaris@gmail.com
                  </a>
                  
                  <p className="text-xs text-muted-foreground text-center">
                    Typical response time: Within 24 hours
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-6 flex flex-col gap-2">
              <Button
                variant="outline"
                onClick={() => navigate('/')}
                className="w-full justify-start gap-2"
              >
                <Home className="h-4 w-4" />
                Return to Home
              </Button>
            </div>
          </div>

          <div className="md:w-2/3 bg-background rounded-lg overflow-hidden border">
            {activeTab === 'chat' ? (
              <Chat userId={userId} />
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                <Mail className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Email Support</h3>
                <p className="text-muted-foreground text-sm mb-6">
                  Have a question or need assistance? Send us an email and our support team will get back to you as soon as possible.
                </p>
                <a
                  href="mailto:contact.elyonaris@gmail.com?subject=Exam%20Support%20Request"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors"
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Mail className="h-4 w-4" />
                  Open Email
                </a>
              </div>
            )}
          </div>
<<<<<<< HEAD
=======
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo.png';
import { useNavigate } from 'react-router-dom';

const ContactUs = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a2e0a] via-[#0d3d0d] to-[#0a2e0a] p-4">
      <div className="bg-card rounded-lg shadow-2xl p-8 max-w-lg w-full text-center">
        <img src={logo} alt="ELYONARIS TEST V1.0" className="h-16 w-16 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Contact Us</h1>
        <p className="text-muted-foreground mb-6">Have a question, need help, or want to report an issue? Reach out to our support team below.</p>

        <div className="mb-6">
          <a
            href="mailto:contact.elyonaris@gmail.com?subject=Exam%20Support%20Request"
            className="inline-block px-6 py-3 rounded bg-accent text-accent-foreground font-semibold hover:bg-accent/90 transition text-lg"
            target="_blank" rel="noopener noreferrer"
          >
            Email Support
          </a>
        </div>

        <div className="text-sm text-muted-foreground">
          Or email us directly at <span className="font-mono">contact.elyonaris@gmail.com</span>
        </div>
        
        <div className="mt-6 flex justify-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/')}
            aria-label="Return to home"
          >
            Return to Home
          </Button>

          <Button
            size="sm"
            onClick={() => window.open('mailto:contact.elyonaris@gmail.com?subject=Exam%20Support%20Request', '_blank')}
            aria-label="Email support"
          >
            Proceed
          </Button>
>>>>>>> 2baa9b4adeb7dc3265ee54dbd332be1c7f2f0631
=======
>>>>>>> eb1952c30efaaf4746d887d80d31bdb1ab685cb6
        </div>
      </div>
    </div>
  );
};

<<<<<<< HEAD
export default ContactUs;
=======
export default ContactUs;
>>>>>>> eb1952c30efaaf4746d887d80d31bdb1ab685cb6
