import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const pageTitles: Record<string, string> = {
  '/landing': 'Elyon Tested - Home',
  '/login': 'Elyon Tested - Login',
  '/registration': 'Elyon Tested - Registration',
  '/dashboard': 'Elyon Tested - Dashboard',
  '/exam': 'Elyon Tested - Exam',
  '/exam/submitted': 'Elyon Tested - Exam Submitted',
  '/exam/cancelled': 'Elyon Tested - Exam Cancelled',
  '/contactus': 'Elyon Tested - Contact Us',
  '/forgotid': 'Elyon Tested - Forgot ID',
  '/admin': 'Elyon Tested - Admin'
};

export const PageTitle = () => {
  const location = useLocation();
  const pathname = location.pathname.toLowerCase();

  useEffect(() => {
    // Find the most specific matching route
    const matchingRoute = Object.keys(pageTitles)
      .sort((a, b) => b.length - a.length) // Sort by length to match more specific paths first
      .find(route => pathname.startsWith(route));

    const title = matchingRoute ? pageTitles[matchingRoute] : 'Elyon Tested';
    document.title = title;
  }, [pathname]);

  return null;
};
