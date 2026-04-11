import React, { useState } from 'react';

export default function App() {
  const [tela, setTela] = useState<'login' | 'sistema'>('login');
  const [perfil, setPerfil] = useState<'colaborador' | 'atendente'>('colaborador');
  const [chamados, setChamados] = useState([
    { 
      id: '0001', 
      titulo: 'Erro no acesso ao ERP', 
      descricao: 'Minha senha não funciona desde a atualização de ontem.', 
      categoria: 'Sistemas', 
      urgencia: 'Alta', 
      status: 'Aberto' 
    }
  ]);

  // Estados do Formulário
  const [inputTitulo, setInputTitulo] = useState('');
  const [inputDesc, setInputDesc] = useState('');
  const [inputCat, setInputCat] = useState('Sistemas');
  const [inputUrg, setInputUrg] = useState('Média');

  const realizarLogin = (p: 'colaborador' | 'atendente') => {
    setPerfil(p);
    setTela('sistema');
  };

  const handleEnviarChamado = () => {
    if (!inputTitulo || !inputDesc) return alert("Preencha o título e a descrição!");
    const novo = {
      id: Math.floor(1000 + Math.random() * 9000).toString(),
      titulo: inputTitulo,
      descricao: inputDesc,
      categoria: inputCat,
      urgencia: inputUrg,
      status: 'Aberto'
    };
    setChamados([novo, ...chamados]);
    setInputTitulo('');
    setInputDesc('');
    alert("Solicitação enviada com sucesso!");
  };

  const atualizarStatus = (id: string) => {
    setChamados(chamados.map(c => 
      c.id === id ? { ...c, status: c.status === 'Aberto' ? 'Em Atendimento' : 'Finalizado' } : c
    ));
  };

  if (tela === 'login') {
    return (
      <div className="min-h-screen bg-[#003C3C] flex items-center justify-center p-6 font-sans">
        <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md text-center border-t-8 border-[#9DFF9D]">
          <div className="bg-[#9DFF9D] text-[#003C3C] font-black px-4 py-2 rounded-lg text-2xl inline-block mb-6 italic">v(dev)</div>
          <h1 className="text-2xl font-black text-[#003C3C] mb-8 uppercase tracking-tighter">Backoffice de Chamados</h1>
          <div className="space-y-4">
            <button onClick={() => realizarLogin('colaborador')} className="w-full bg-[#003C3C] text-white p-4 rounded-xl font-black uppercase hover:bg-[#9DFF9D] hover:text-[#003C3C] transition-all transform active:scale-95">Sou Solicitante</button>
            <button onClick={() => realizarLogin('atendente')} className="w-full border-2 border-[#003C3C] text-[#003C3C] p-4 rounded-xl font-black uppercase hover:bg-slate-50 transition-all transform active:scale-95">Sou Atendente</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0FAF0] font-sans">
      <nav className="bg-[#003C3C] text-white p-4 flex justify-between items-center border-b-4 border-[#9DFF9D] sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button onClick={() => setTela('login')} className="text-[#9DFF9D] font-bold text-xs uppercase underline hover:text-white transition">Sair</button>
          <span className="font-black italic tracking-widest">VISAGIO PROJECTS</span>
        </div>
        <div className="bg-[#9DFF9D] text-[#003C3C] px-4 py-1 rounded-full text-[10px] font-black uppercase">Acesso: {perfil}</div>
      </nav>

      <main className="p-6 max-w-7xl mx-auto">
        {perfil === 'colaborador' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit space-y-4">
              <h2 className="text-lg font-black uppercase italic border-l-4 border-[#9DFF9D] pl-3 text-[#003C3C]">Nova Solicitação</h2>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">O que está acontecendo?</label>
                <input value={inputTitulo} onChange={(e) => setInputTitulo(e.target.value)} placeholder="Título curto do problema" className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#9DFF9D] transition" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">Área</label>
                  <select value={inputCat} onChange={(e) => setInputCat(e.target.value)} className="w-full border p-3 rounded-xl text-sm bg-white outline-none">
                    <option>Sistemas</option>
                    <option>Dados</option>
                    <option>Acessos</option>
                    <option>Financeiro</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">Urgência</label>
                  <select value={inputUrg} onChange={(e) => setInputUrg(e.target.value)} className={`w-full border p-3 rounded-xl text-sm bg-white outline-none font-bold ${inputUrg === 'Alta' ? 'text-red-500' : 'text-slate-700'}`}>
                    <option>Baixa</option>
                    <option>Média</option>
                    <option>Alta</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">Explique com detalhes</label>
                <textarea value={inputDesc} onChange={(e) => setInputDesc(e.target.value)} placeholder="Passo a passo do erro..." className="w-full border p-3 rounded-xl h-32 outline-none focus:ring-2 focus:ring-[#9DFF9D] transition" />
              </div>
              <button onClick={handleEnviarChamado} className="w-full bg-[#003C3C] text-white py-4 rounded-xl font-black uppercase hover:bg-[#9DFF9D] hover:text-[#003C3C] transition shadow-lg shadow-green-200 active:scale-95">Abrir Chamado</button>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <h2 className="font-black uppercase text-slate-400 text-sm italic">Status dos meus pedidos</h2>
              {chamados.map(c => (
                <div key={c.id} className="bg-white p-5 rounded-2xl border border-slate-200 flex justify-between items-start hover:shadow-md transition">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black bg-slate-100 px-2 py-0.5 rounded text-slate-500">#{c.id}</span>
                      <span className="text-[10px] font-bold text-[#003C3C] uppercase">{c.categoria}</span>
                    </div>
                    <p className="font-bold text-slate-800">{c.titulo}</p>
                    <p className="text-xs text-slate-400 mt-1">{c.descricao}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${c.status === 'Aberto' ? 'bg-yellow-100 text-yellow-700' : 'bg-[#9DFF9D] text-[#003C3C]'}`}>{c.status}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* FILA DO ATENDENTE COM DETALHES COMPLETOS */
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xl">
            <div className="p-6 bg-slate-50 border-b flex justify-between items-center">
              <h2 className="font-black uppercase italic text-[#003C3C]">Fila de Atendimento Priorizada</h2>
              <span className="bg-[#003C3C] text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase">Aguardando: {chamados.filter(c => c.status !== 'Finalizado').length}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b text-[10px] font-black text-slate-400 uppercase">
                  <tr>
                    <th className="p-6">Informações do Chamado</th>
                    <th className="p-6 text-center">Urgência</th>
                    <th className="p-6 text-center">Status</th>
                    <th className="p-6 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {chamados.map(c => (
                    <tr key={c.id} className={`hover:bg-[#F0FAF0] transition ${c.status === 'Finalizado' ? 'opacity-50' : ''}`}>
                      <td className="p-6">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-black text-[#003C3C] uppercase">{c.categoria} • ID #{c.id}</span>
                          <p className="font-black text-lg text-slate-800 tracking-tighter">{c.titulo}</p>
                          <div className="mt-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
                            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Descrição do Usuário:</p>
                            <p className="text-sm text-slate-600 italic leading-relaxed">"{c.descricao}"</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-6 text-center">
                        <span className={`px-2 py-1 rounded text-[10px] font-black border-2 ${c.urgencia === 'Alta' ? 'border-red-500 text-red-500' : 'border-slate-300 text-slate-400'}`}>
                          {c.urgencia.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-6 text-center">
                        <span className={`font-black text-[10px] uppercase ${c.status === 'Aberto' ? 'text-yellow-600' : 'text-green-600'}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="p-6 text-right">
                        {c.status !== 'Finalizado' && (
                          <button 
                            onClick={() => atualizarStatus(c.id)} 
                            className="bg-[#003C3C] text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase hover:bg-[#9DFF9D] hover:text-[#003C3C] transition transform active:scale-95 shadow-md"
                          >
                            {c.status === 'Aberto' ? 'Atender Agora' : 'Finalizar Chamado'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}