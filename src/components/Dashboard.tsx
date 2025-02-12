import React, { useState, useEffect } from 'react';
import { generateMarketingCopy } from '../lib/gemini';
import { auth, db, COPIES_COLLECTION, convertTimestamp } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';
import { Sparkles, LogOut, Star, Trash } from 'lucide-react';
import toast from 'react-hot-toast';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, updateDoc, Timestamp } from 'firebase/firestore';

interface Copy {
  id: string;
  productName: string;
  content: string;
  favorite: boolean;
  createdAt: Date;
  userId: string;
  tone?: string;
  niche?: string;
  target?: string[];
  language?: string;
}

export function Dashboard() {
  const [productName, setProductName] = useState('');
  const [generatedCopy, setGeneratedCopy] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copies, setCopies] = useState<Copy[]>([]);
  const navigate = useNavigate();

  // New state variables for manual copy definition
  const [manualTone, setManualTone] = useState('');
  const [manualNiche, setManualNiche] = useState('');
  const [selectedTargets, setSelectedTargets] = useState<string[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState('PT-BR');

  useEffect(() => {
    loadCopies();
  }, []);

  const loadCopies = async () => {
    if (!auth.currentUser) return;

    try {
      // Simplified query without orderBy to avoid index requirement
      const q = query(
        collection(db, COPIES_COLLECTION),
        where('userId', '==', auth.currentUser.uid)
      );

      const querySnapshot = await getDocs(q);
      const loadedCopies = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: convertTimestamp(data.createdAt)
        } as Copy;
      });
      
      // Sort copies in memory instead
      const sortedCopies = loadedCopies.sort((a, b) => 
        b.createdAt.getTime() - a.createdAt.getTime()
      );
      
      setCopies(sortedCopies);
    } catch (error) {
      console.error('Error loading copies:', error);
      toast.error('Falha ao carregar cópias salvas');
    }
  };

  const handleGenerateCopy = async () => {
    if (!productName.trim()) {
      toast.error('Por favor, insira um nome de produto');
      return;
    }

    setIsLoading(true);
    setGeneratedCopy('');

    try {
      let prompt = `Crie uma copy de marketing atraente para um produto chamado "${productName}". `;
      if (manualTone) {
        prompt += `O tom deve ser ${manualTone}. `;
      }
      if (manualNiche) {
        prompt += `O nicho é ${manualNiche}. `;
      }
      if (selectedTargets.length > 0) {
        prompt += `A copy deve ser otimizada para ${selectedTargets.join(', ')}. `;
      }
      prompt += `A copy deve ser envolvente, destacar os principais benefícios e ter cerca de 2 a 3 parágrafos. Concentre-se em criar entusiasmo e proposta de valor.`;

      if (selectedLanguage === 'EN') {
        prompt = `Create a compelling marketing copy for a product called "${productName}". `;
        if (manualTone) {
          prompt += `The tone should be ${manualTone}. `;
        }
        if (manualNiche) {
          prompt += `The niche is ${manualNiche}. `;
        }
        if (selectedTargets.length > 0) {
          prompt += `The copy should be optimized for ${selectedTargets.join(', ')}. `;
        }
        prompt += `The copy should be engaging, highlight key benefits, and be around 2-3 paragraphs long. Focus on creating excitement and value proposition.`;
      }

      const copy = await generateMarketingCopy(prompt);
      if (!copy) {
        throw new Error('Nenhum conteúdo gerado');
      }

      setGeneratedCopy(copy);

      // Save to Firestore
      if (auth.currentUser) {
        const newCopy = {
          productName,
          content: copy,
          favorite: false,
          createdAt: Timestamp.now(),
          userId: auth.currentUser.uid,
          tone: manualTone,
          niche: manualNiche,
          target: selectedTargets,
          language: selectedLanguage
        };

        await addDoc(collection(db, COPIES_COLLECTION), newCopy);
        await loadCopies();
      }

      toast.success('Copy gerada e salva com sucesso!');
    } catch (error) {
      console.error('Error:', error);
      toast.error(error instanceof Error ? error.message : 'Falha ao gerar copy. Por favor, tente novamente.');
      setGeneratedCopy('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFavorite = async (copyId: string) => {
    try {
      const copyRef = doc(db, COPIES_COLLECTION, copyId);
      const copy = copies.find(c => c.id === copyId);
      if (!copy) return;

      await updateDoc(copyRef, {
        favorite: !copy.favorite
      });

      setCopies(prevCopies =>
        prevCopies.map(c =>
          c.id === copyId ? { ...c, favorite: !copy.favorite } : c
        )
      );

      toast.success(copy.favorite ? 'Removido dos favoritos' : 'Adicionado aos favoritos');
    } catch (error) {
      toast.error('Falha ao atualizar o status de favorito');
    }
  };

  const handleDelete = async (copyId: string) => {
    try {
      await deleteDoc(doc(db, COPIES_COLLECTION, copyId));
      setCopies(prevCopies => prevCopies.filter(c => c.id !== copyId));
      toast.success('Copy excluída com sucesso');
    } catch (error) {
      toast.error('Falha ao excluir copy');
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login');
      toast.success('Logout realizado com sucesso');
    } catch (error) {
      toast.error('Falha ao fazer logout');
    }
  };

  const targetOptions = ['Google Ads', 'Instagram', 'Facebook', 'Email Marketing', 'Website'];
  const languageOptions = ['PT-BR', 'EN'];

  const handleTargetChange = (target: string) => {
    setSelectedTargets(prevTargets => {
      if (prevTargets.includes(target)) {
        return prevTargets.filter(t => t !== target);
      } else {
        return [...prevTargets, target];
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <nav className="bg-black/30 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Sparkles className="h-8 w-8 text-purple-400" />
              <span className="ml-2 text-xl font-semibold text-white">Marcos Quantum</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center text-gray-300 hover:text-white transition-colors"
            >
              <LogOut className="h-5 w-5 mr-2" />
              Sair
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-black/30 backdrop-blur-sm rounded-lg shadow-xl border border-purple-500/20 p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4 text-white">Gerar Copy de Marketing</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">
                Nome do Produto
              </label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="mt-1 block w-full rounded-md bg-gray-900/50 border-purple-500/30 text-white shadow-sm focus:border-purple-500 focus:ring-purple-500 placeholder-gray-500"
                placeholder="Insira o nome do seu produto"
                disabled={isLoading}
              />
            </div>

            {/* Manual Definition Fields */}
            <div>
              <label className="block text-sm font-medium text-gray-300">Tom</label>
              <input
                type="text"
                value={manualTone}
                onChange={(e) => setManualTone(e.target.value)}
                className="mt-1 block w-full rounded-md bg-gray-900/50 border-purple-500/30 text-white shadow-sm focus:border-purple-500 focus:ring-purple-500 placeholder-gray-500"
                placeholder="Ex: Formal, Casual, Humorístico"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">Nicho</label>
              <input
                type="text"
                value={manualNiche}
                onChange={(e) => setManualNiche(e.target.value)}
                className="mt-1 block w-full rounded-md bg-gray-900/50 border-purple-500/30 text-white shadow-sm focus:border-purple-500 focus:ring-purple-500 placeholder-gray-500"
                placeholder="Ex: Tecnologia, Beleza, Fitness"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">Plataformas Alvo</label>
              <div className="flex flex-wrap gap-2">
                {targetOptions.map((target) => (
                  <label key={target} className="inline-flex items-center">
                    <input
                      type="checkbox"
                      className="rounded text-purple-500 focus:ring-purple-500"
                      value={target}
                      checked={selectedTargets.includes(target)}
                      onChange={() => handleTargetChange(target)}
                      disabled={isLoading}
                    />
                    <span className="ml-2 text-gray-300">{target}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">Idioma</label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="mt-1 block w-full rounded-md bg-gray-900/50 border-purple-500/30 text-white shadow-sm focus:border-purple-500 focus:ring-purple-500"
                disabled={isLoading}
              >
                {languageOptions.map((lang) => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleGenerateCopy}
              disabled={isLoading || !productName.trim()}
              className="w-full bg-gradient-to-r from-purple-600 to-violet-600 text-white py-2 px-4 rounded-md hover:from-purple-700 hover:to-violet-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Gerando...
                </span>
              ) : (
                'Gerar Copy'
              )}
            </button>
          </div>
        </div>

        {generatedCopy && (
          <div className="bg-black/30 backdrop-blur-sm rounded-lg shadow-xl border border-purple-500/20 p-6 animate-fade-in mb-6">
            <h3 className="text-xl font-semibold mb-4 text-white">Copy Gerada</h3>
            <div className="prose max-w-none">
              {generatedCopy.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4 text-gray-300 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {copies.map((copy) => (
            <div
              key={copy.id}
              className="bg-black/30 backdrop-blur-sm rounded-lg shadow-xl border border-purple-500/20 p-6 hover:border-purple-500/40 transition-all duration-200"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-white">{copy.productName}</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleToggleFavorite(copy.id)}
                    className={`p-1 rounded-full hover:bg-purple-500/20 transition-colors ${
                      copy.favorite ? 'text-yellow-400' : 'text-gray-400'
                    }`}
                  >
                    <Star className="h-5 w-5" fill={copy.favorite ? 'currentColor' : 'none'} />
                  </button>
                  <button
                    onClick={() => handleDelete(copy.id)}
                    className="p-1 rounded-full hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <Trash className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="prose max-w-none">
                {copy.content.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4 text-gray-300 text-sm leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
