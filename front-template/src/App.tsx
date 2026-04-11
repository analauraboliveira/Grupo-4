import React, { useState } from 'react';

/* Sistema de Backoffice - Visagio
 */
export default function App() {
  // Roteamento simples via estado (SPA mode)
  const [tela, setTela] = useState<'login' | 'sistema'>('login');
  const [perfil, setPerfil] = useState<'colaborador' | 'atendente' | null>(null);
  
  // Simulação de sessão
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  // Persistência em memória dos chamados e lógica de ID sequencial
  const [proximoId, setProximoId] = useState(2);
  const [chamados, setChamados] = useState([
    { 
      id: '0001', 
      titulo: 'Erro de login no portal de projetos', 
      status: 'Em triagem',
      urgencia: 'Baixa',
      impacto: 'Baixo',
      categoria: 'Sistemas',
      tipo: 'Incidente',
      prazo: '',
      solucao: ''
    }
  ]);

  // States do Form 
  const [inputTitulo, setInputTitulo] = useState('');
  const [inputImpacto, setInputImpacto] = useState('Baixo');
  const [inputUrgencia, setInputUrgencia] = useState('Baixa');
  const [inputCat, setInputCat] = useState('Sistemas');
  const [inputTipo, setInputTipo] = useState('Incidente');
  const [inputPrazo, setInputPrazo] = useState('');
  const [inputDesc, setInputDesc] = useState('');

  // Handler de Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (usuario === 'colab@visagio.com' && senha === '123') {
      setPerfil('colaborador'); setTela('sistema');
    } else if (usuario === 'adm@visagio.com' && senha === 'admin') {
      setPerfil('atendente'); setTela('sistema');
    } else {
      setErro('Credenciais inválidas.');
    }
  };

  // Logic: Criação de novo ticket com formatação de ID 
  const handleEnviarChamado = () => {
    if (!inputTitulo || !inputDesc) return alert("Preencha os campos obrigatórios!");
    
    const idFormatado = proximoId.toString().padStart(4, '0');
    const novo = {
      id: idFormatado,
      titulo: inputTitulo,
      status: 'Aberto', // Todo chamado nasce com status default 'Aberto'
      urgencia: inputUrgencia,
      impacto: inputImpacto,
      categoria: inputCat,
      tipo: inputTipo,
      prazo: inputPrazo,
      solucao: ''
    };
    
    setChamados([novo, ...chamados]); // Spread para manter imutabilidade e ordem decrescente
    setProximoId(proximoId + 1);
    
    // Reset de form (UX Clean)
    setInputTitulo(''); setInputDesc(''); setInputPrazo('');
    alert(`Chamado #${idFormatado} enviado com sucesso!`);
  };

  // State Updates: Funções de transição de status para o Backoffice 
  const atualizarStatus = (id: string, novoStatus: string) => {
    setChamados(chamados.map(c => c.id === id ? { ...c, status: novoStatus } : c));
  };

  // Resolve Logic: Captura de input para o campo de Solução Aplicada
  const resolverChamado = (id: string) => {
    const comentario = prompt("Descreva a solução aplicada (Log de Resolução):");
    if (comentario) {
      setChamados(chamados.map(c => c.id === id ? { ...c, status: 'Resolvido', solucao: comentario } : c));
    }
  };

  // UI: View de Autenticação 
  if (tela === 'login') {
    return (
      <div className="min-h-screen bg-[#003C3C] flex items-center justify-center p-6 font-sans">
        <div className="bg-white p-10 rounded-[32px] shadow-2xl w-full max-w-md border-t-[12px] border-[#9DFF9D]">
          <div className="text-center mb-10">
            <div className="bg-[#9DFF9D] text-[#003C3C] font-black px-5 py-2 rounded-xl text-2xl inline-block italic mb-4">v(dev)</div>
            <h1 className="text-2xl font-black text-[#003C3C] uppercase tracking-tighter">Backoffice</h1>
          </div>
          <form onSubmit={handleLogin} className="space-y-5">
            <input type="email" placeholder="E-mail Corporativo" value={usuario} onChange={e => setUsuario(e.target.value)} className="w-full border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-[#9DFF9D] transition-all" />
            <input type="password" placeholder="Senha" value={senha} onChange={e => setSenha(e.target.value)} className="w-full border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-[#9DFF9D] transition-all" />
            {erro && <p className="text-red-500 text-[10px] font-black text-center uppercase tracking-widest">{erro}</p>}
            <button type="submit" className="w-full bg-[#003C3C] text-white py-5 rounded-2xl font-black uppercase hover:bg-[#9DFF9D] hover:text-[#003C3C] transition transform active:scale-95">Acessar Plataforma</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F1F9F1] font-sans">
      {/* Navbar Global - Persistente no Sistema */}
      <nav className="bg-[#003C3C] text-white p-4 flex justify-between items-center border-b-4 border-[#9DFF9D] sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="bg-[#9DFF9D] text-[#003C3C] font-black px-3 py-1 rounded-lg text-sm italic">v(dev)</div>
          <span className="font-black text-xs tracking-widest uppercase opacity-80">Backoffice de Chamados</span>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setPerfil(perfil === 'colaborador' ? 'atendente' : 'colaborador')} className="bg-[#9DFF9D] text-[#003C3C] px-4 py-1 rounded-lg text-[10px] font-black uppercase shadow-sm hover:brightness-110">Simular {perfil === 'colaborador' ? 'Atendente' : 'Solicitante'}</button>
          <button onClick={() => setTela('login')} className="text-white text-[10px] font-bold underline uppercase opacity-70 hover:opacity-100">Sair</button>
        </div>
      </nav>

      <main className="p-8 max-w-7xl mx-auto">
        {perfil === 'colaborador' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* View Colaborador: Form de Solicitação (Grid 5/12) */}
            <div className="lg:col-span-5 bg-white p-8 rounded-[32px] shadow-lg border border-slate-100 space-y-6">
              <h2 className="text-xl font-black text-[#003C3C] italic border-l-4 border-[#9DFF9D] pl-4 uppercase">Nova Solicitação</h2>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Título do Problema</label>
                  <input value={inputTitulo} onChange={e => setInputTitulo(e.target.value)} placeholder="Ex: Erro no acesso ao ERP" className="w-full border-2 border-slate-50 p-3 rounded-xl text-sm bg-slate-50 focus:bg-white transition-all" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Impacto</label>
                    <select value={inputImpacto} onChange={e => setInputImpacto(e.target.value)} className="w-full border-2 border-slate-50 p-3 rounded-xl text-xs bg-slate-50 font-bold"><option>Baixo</option><option>Médio</option><option>Alto</option></select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Urgência</label>
                    <select value={inputUrgencia} onChange={e => setInputUrgencia(e.target.value)} className="w-full border-2 border-slate-50 p-3 rounded-xl text-xs bg-slate-50 font-bold"><option>Baixa</option><option>Média</option><option>Alta</option><option>Urgente</option></select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Categoria</label>
                    <select value={inputCat} onChange={e => setInputCat(e.target.value)} className="w-full border-2 border-slate-50 p-3 rounded-xl text-xs bg-slate-50"><option>Sistemas</option><option>Dados</option><option>Acessos</option><option>Financeiro</option></select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Tipo</label>
                    <select value={inputTipo} onChange={e => setInputTipo(e.target.value)} className="w-full border-2 border-slate-50 p-3 rounded-xl text-xs bg-slate-50"><option>Incidente</option><option>Requisição</option><option>Dúvida</option><option>Melhoria</option></select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Prazo Desejado</label>
                  <input type="date" value={inputPrazo} onChange={e => setInputPrazo(e.target.value)} className="w-full border-2 border-slate-50 p-3 rounded-xl text-xs bg-slate-50" />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Descrição Detalhada</label>
                  <textarea value={inputDesc} onChange={e => setInputDesc(e.target.value)} placeholder="Forneça detalhes para acelerar a triagem..." className="w-full border-2 border-slate-50 p-3 rounded-xl h-24 text-sm bg-slate-50 focus:bg-white transition-all" />
                </div>
              </div>

              <button onClick={handleEnviarChamado} className="w-full bg-[#003C3C] text-white py-4 rounded-2xl font-black uppercase hover:bg-[#9DFF9D] hover:text-[#003C3C] transition shadow-md active:scale-95">Enviar Chamado</button>
            </div>

            {/* View Colaborador: Histórico Pessoal (Grid 7/12) */}
            <div className="lg:col-span-7 space-y-6">
              <h2 className="text-xl font-black text-[#003C3C] italic border-b-2 border-slate-200 pb-2 uppercase tracking-tight">Meus Chamados</h2>
              <div className="space-y-4">
                {chamados.map(c => (
                  <div key={c.id} className="bg-white p-6 rounded-[24px] border border-slate-100 flex justify-between items-center shadow-sm hover:border-[#9DFF9D] transition-all">
                    <div>
                      <span className="text-[9px] font-black bg-slate-50 text-slate-400 px-2 py-1 rounded-md mb-2 inline-block">TICKET ID #{c.id}</span>
                      <p className="font-black text-slate-700 text-lg leading-tight">{c.titulo}</p>
                      {c.solucao && (
                        <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-100">
                          <p className="text-[10px] text-green-700 font-bold uppercase tracking-tighter">Solução Aplicada:</p>
                          <p className="text-xs text-green-600 italic">{c.solucao}</p>
                        </div>
                      )}
                    </div>
                    <span className="bg-blue-50 text-blue-600 border border-blue-100 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{c.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* View Atendente: Gestão da Fila Geral */
          <div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-2xl">
            <div className="p-8 bg-slate-50 border-b flex justify-between items-center">
              <h2 className="text-xl font-black italic text-[#003C3C] uppercase">Fila de Atendimento</h2>
              <span className="bg-[#003C3C] text-white px-4 py-1 rounded-full text-[10px] font-black uppercase italic">Privilégio: Atendente</span>
            </div>
            <div className="overflow-x-auto p-4">
              <table className="w-full text-left">
                <thead className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b-2">
                  <tr><th className="p-6">Solicitação</th><th className="p-6">Prioridade</th><th className="p-6">Status</th><th className="p-6 text-right">Ações de Gestão</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {chamados.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-6">
                        <p className="text-[9px] font-black text-slate-300">ID #{c.id}</p>
                        <p className="font-black text-slate-800 text-lg tracking-tight">{c.titulo}</p>
                      </td>
                      <td className="p-6">
                        <span className={`text-[10px] font-black px-4 py-1 rounded-full border-2 ${c.urgencia === 'Urgente' || c.urgencia === 'Alta' ? 'border-red-500 text-red-500 bg-red-50' : 'border-slate-200 text-slate-400'}`}>
                          {c.urgencia.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-6">
                        <span className="text-[10px] font-bold text-blue-500 uppercase italic underline decoration-2 underline-offset-4">{c.status}</span>
                      </td>
                      <td className="p-6 text-right">
                        <div className="flex flex-col gap-2 items-end">
                           <div className="flex gap-2">
                              <button onClick={() => atualizarStatus(c.id, 'Em atendimento')} className="text-[9px] font-black bg-blue-100 text-blue-700 px-3 py-2 rounded-xl uppercase hover:bg-blue-200 transition-colors">Atender</button>
                              <button onClick={() => atualizarStatus(c.id, 'Aguardando Solicitante')} className="text-[9px] font-black bg-yellow-100 text-yellow-700 px-3 py-2 rounded-xl uppercase hover:bg-yellow-200 transition-colors">+ Info</button>
                           </div>
                           <button onClick={() => resolverChamado(c.id)} className="w-full text-[9px] font-black bg-[#003C3C] text-white px-3 py-2 rounded-xl uppercase hover:bg-[#9DFF9D] hover:text-[#003C3C] transition-all">Resolver e Encerrar</button>
                        </div>
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