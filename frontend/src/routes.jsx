import { useRoutes, Navigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import BooksList from './pages/BooksList.jsx';
import BookNew from './pages/BookNew.jsx';
import BookDetail from './pages/BookDetail.jsx';

export function AppRoutes() {
  const routes = useRoutes([
    { path: '/', element: <Navigate to="/books" replace /> },
    { path: '/login', element: <Login /> },
    { path: '/register', element: <Register /> },
    { path: '/books', element: <BooksList /> },
    { path: '/books/new', element: <BookNew /> },
    { path: '/books/:id', element: <BookDetail /> },
    { path: '*', element: <div className="text-muted text-sm">ページが見つかりません。</div> },
  ]);
  return routes;
}
