import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

type PageMeta = {
  title: string;
  description: string;
  image: string;
};

// Helper function to get the correct image URL
const getImageUrl = (path: string) => {
  // In development, use the full URL to the public folder
  if (import.meta.env.DEV) {
    return `http://localhost:8082${path}`;
  }
  // In production, use the base URL
  return `${window.location.origin}${path}`;
};

const pageMeta: Record<string, PageMeta> = {
  '/': {
    title: 'ELYONTESTED V1.0 - Secure Exam Platform',
    description: 'Secure exam platform for students with Google Forms integration, anti-cheating measures, and real-time monitoring',
    image: getImageUrl('/A.png')
  },
  '/landing': {
    title: 'Elyon Tested - Home',
    description: 'Welcome to Elyon Tested - Your secure exam platform',
    image: getImageUrl('/A.png')
  },
  '/login': {
    title: 'Elyon Tested - Login',
    description: 'Login to your Elyon Tested account',
    image: getImageUrl('/A.png')
  },
  '/registration': {
    title: 'Elyon Tested - Registration',
    description: 'Register for a new Elyon Tested account',
    image: getImageUrl('/A.png')
  },
  '/dashboard': {
    title: 'Elyon Tested - Dashboard',
    description: 'Your exam dashboard',
    image: getImageUrl('/A.png')
  },
  // Add other routes as needed
};

export const PageTitle = () => {
  const location = useLocation();
  const pathname = location.pathname.toLowerCase();

  useEffect(() => {
    // Find the most specific matching route
    const matchingRoute = Object.keys(pageMeta)
      .sort((a, b) => b.length - a.length)
      .find(route => pathname.startsWith(route));

    const meta = matchingRoute ? pageMeta[matchingRoute] : {
      title: 'Elyon Tested',
      description: 'Secure exam platform',
      image: getImageUrl('/A.png')
    };

    // Update document title
    document.title = meta.title;

    // Update meta tags
    updateMetaTag('description', meta.description);
    updateMetaTag('og:title', meta.title);
    updateMetaTag('og:description', meta.description);
    updateMetaTag('og:image', meta.image);
    updateMetaTag('og:url', window.location.href);
    updateMetaTag('og:type', 'website');
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:site', '@ELYONTESTED');
    updateMetaTag('twitter:title', meta.title);
    updateMetaTag('twitter:description', meta.description);
    updateMetaTag('twitter:image', meta.image);

  }, [pathname]);

  // Helper function to update or create meta tags
  const updateMetaTag = (name: string, content: string) => {
    // Handle both standard and Open Graph meta tags
    const isOpenGraph = name.startsWith('og:');
    const selector = isOpenGraph 
      ? `meta[property="${name}"]` 
      : `meta[name="${name}"]`;
    
    let element = document.querySelector(selector) as HTMLMetaElement;
    
    if (!element) {
      element = document.createElement('meta');
      if (isOpenGraph) {
        element.setAttribute('property', name);
      } else {
        element.setAttribute('name', name);
      }
      document.head.appendChild(element);
    }
    element.content = content;
  };

  return null;
};