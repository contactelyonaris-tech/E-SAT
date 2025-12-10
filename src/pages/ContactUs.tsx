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
        </div>
      </div>
    </div>
  );
};

export default ContactUs;