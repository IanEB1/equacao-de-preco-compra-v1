import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirecionar para a página de escolha de entrada de dados
    navigate('/data-entry-choice');
  }, [navigate]);

  return null;
};

export default Index;