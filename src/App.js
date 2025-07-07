import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Home from './components/Home';
import Historico from './components/Historico';
import Valores from './components/Valores';

const itemsBase = {
  hamburguer: 10,
  cachorroQuente: 8,
  refrigerante: 5,
};

export default function App() {
  const [page, setPage] = useState('home');
  const [valores, setValores] = useState(itemsBase);

  function handleValorChange(item, novoValor) {
    setValores(prev => ({ ...prev, [item]: Number(novoValor) }));
  }

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar page={page} setPage={setPage} />

      <main style={{ flex: 1, padding: 20 }}>
        {page === 'home' && <Home valores={valores} />}
        {page === 'historico' && <Historico />}
        {page === 'valores' && <Valores valores={valores} onChange={handleValorChange} />}
      </main>
    </div>
  );
}
