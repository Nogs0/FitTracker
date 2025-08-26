import { Redirect } from 'expo-router';

// Este componente não renderiza nada, apenas redireciona.
export default function TabIndex() {
  // Redireciona para a rota '/collections', que é a tela inicial da sua primeira aba.
  return <Redirect href="/settings" />;
}