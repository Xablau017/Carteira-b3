export { default } from 'next-auth/middleware';

export const config = {
  matcher: [
    '/',
    '/ativos',
    '/transacoes',
    '/dividendos',
    '/api/assets/:path*',
    '/api/dividends/:path*',
    '/api/dashboard/:path*',
    '/api/import-:path*',
    '/api/update-:path*',
  ],
};
