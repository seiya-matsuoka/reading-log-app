import { useRoutes, Navigate } from 'react-router-dom';

export function AppRoutes() {
  const routes = useRoutes([
    { path: '/', element: <Navigate to="/books" replace /> },
    { path: '*', element: <div className="text-sm text-gray-500">ページが見つかりません。</div> },
  ]);

  return routes;
}
