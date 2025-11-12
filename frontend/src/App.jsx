import { AppRoutes } from './routes.jsx';
import Header from './components/common/Header.jsx';

export default function App() {
  return (
    <div className="bg-bg text-text min-h-screen">
      <Header />
      <main className="container mx-auto max-w-5xl px-4 py-6">
        <AppRoutes />
      </main>
    </div>
  );
}
