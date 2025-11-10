import { Outlet } from 'react-router-dom';
import { AppRoutes } from './routes.jsx';
import Header from './components/common/Header.jsx';

export default function App() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main className="container mx-auto max-w-5xl px-4 py-6">
        <AppRoutes />
        <Outlet />
      </main>
    </div>
  );
}
