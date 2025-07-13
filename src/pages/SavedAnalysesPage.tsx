import SavedAnalysesList from '@/components/SavedAnalysesList';
import { useAuth } from '@/components/auth/AuthContext';
import { Navigate } from 'react-router-dom';

const SavedAnalysesPage = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <SavedAnalysesList />;
};

export default SavedAnalysesPage;