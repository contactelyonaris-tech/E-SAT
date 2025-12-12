import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const pageTitles: Record<string, string> = {
<<<<<<< HEAD
<<<<<<< HEAD
  '/landing': 'Elyon Tested - Home',
=======
  '/': 'Elyon Tested - Home',
>>>>>>> 2baa9b4adeb7dc3265ee54dbd332be1c7f2f0631
=======
  '/landing': 'Elyon Tested - Home',
>>>>>>> eb1952c30efaaf4746d887d80d31bdb1ab685cb6
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
