import { withAuth } from 'next-auth/middleware';

export default withAuth({
  callbacks: {
    authorized: ({ token, req }) => {
      const path = req.nextUrl.pathname;
      if (path === '/admin/login') {
        return true;
      }
      return !!token;
    },
  },
  pages: {
    signIn: '/admin/login',
  },
});

export const config = {
  matcher: [
    /*
     * Match all routes starting with /admin, but exclude static assets
     */
    '/admin/:path*',
  ],
};
