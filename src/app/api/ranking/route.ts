import { NextResponse } from 'next/server';
// import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
// import { db } from '@/lib/firebase';
import { adminDb } from '@/lib/firebase-admin';

// Interfaces
interface RankingUser {
  id: string;
  name: string;
  maxScore: number;
}

interface CacheData {
  data: RankingUser[];
  lastUpdate: Date;
  nextUpdate: Date;
}

// Cache em memória
let rankingCache: CacheData | null = null;

// Horários de atualização (em horas UTC)
const UPDATE_HOURS = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23];

// Função para calcular próximo horário de atualização
function getNextUpdateTime(): Date {
  const now = new Date();
  const currentHour = now.getHours();
  
  // Encontra o próximo horário de atualização
  let nextHour = UPDATE_HOURS.find(hour => hour > currentHour);
  
  // Se não encontrou, usa o primeiro horário do próximo dia
  if (!nextHour) {
    nextHour = UPDATE_HOURS[0];
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(nextHour, 0, 0, 0);
    return tomorrow;
  }
  
  // Usa o horário encontrado no mesmo dia
  const nextUpdate = new Date(now);
  nextUpdate.setHours(nextHour, 0, 0, 0);
  return nextUpdate;
}

// Função para verificar se o cache precisa ser atualizado
function shouldUpdateCache(): boolean {
  if (!rankingCache) return true;
  
  const now = new Date();
  return now >= rankingCache.nextUpdate;
}

// Função para buscar ranking do Firestore
async function fetchRankingFromFireStore(): Promise<RankingUser[]> {
  try {
    console.log('🔍 [Ranking API] Iniciando consulta ao Firestore...');
    
    // const usersRef = collection(db, 'users');
    // const q = query(usersRef, orderBy('totalPoints', 'desc'), limit(50));
    // const querySnapshot = await getDocs(q);

    const querySnapshot = await adminDb
      .collection('users')
      .orderBy('maxScore', 'desc')
      .limit(50)
      .get();
    
    console.log(`✅ [Ranking API] Consulta concluída. Documentos encontrados: ${querySnapshot.docs.length}`);
    
    const rankingData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
      maxScore: doc.data().maxScore
    }));
    
    const usersWithPoints = rankingData.filter(user => user.maxScore > 0).length;
    console.log(`📊 [Ranking API] Usuários com pontos: ${usersWithPoints} de ${rankingData.length}`);
    console.log('Dados do ranking:', rankingData);
    
    return rankingData;
  } catch (error) {
    console.error('❌ [Ranking API] Erro ao buscar ranking:', error);
    console.error('❌ [Ranking API] Detalhes do erro:', JSON.stringify(error, null, 2));
    return [];
  }
}

export async function GET() {
  try {
    console.log('🔍 [Ranking API] Requisição recebida');
    console.log('🔍 [Ranking API] Cache atual:', rankingCache ? 'Existe' : 'Não existe');
    console.log('🔍 [Ranking API] Precisa atualizar:', shouldUpdateCache());
    
    // Verifica se o cache precisa ser atualizado
    if (shouldUpdateCache()) {
      console.log('🔄 [Ranking API] Atualizando cache...');
      
      // Cache inválido ou não existe - buscar novos dados
      const data = await fetchRankingFromFireStore();
      
      console.log(`📦 [Ranking API] Dados recebidos: ${data.length} usuários`);
      
      // Atualizar o cache
      rankingCache = {
        data,
        lastUpdate: new Date(),
        nextUpdate: getNextUpdateTime()
      };
      
      console.log('✅ [Ranking API] Cache atualizado com sucesso');
      
      // Retornar dados atualizados
      return NextResponse.json({
        data: rankingCache.data,
        lastUpdate: rankingCache.lastUpdate,
        nextUpdate: rankingCache.nextUpdate,
        rankingCameFromCached: false
      });
    }
    
    // TypeScript safety check - para evitar erro de lint
    if (!rankingCache) {
      console.error('❌ [Ranking API] Cache não disponível após verificação');
      return NextResponse.json(
        { error: 'Cache não disponível' },
        { status: 500 }
      );
    }
    
    console.log('✅ [Ranking API] Retornando dados do cache');
    
    // Cache válido - retornar dados do cache
    return NextResponse.json({
      data: rankingCache.data,
      lastUpdate: rankingCache.lastUpdate,
      nextUpdate: rankingCache.nextUpdate,
      rankingCameFromCached: true
    });
  } catch (error) {
    console.error('❌ [Ranking API] Erro na API de ranking:', error);
    console.error('❌ [Ranking API] Detalhes do erro:', JSON.stringify(error, null, 2));
    return NextResponse.json(
      { error: 'Erro ao processar requisição' },
      { status: 500 }
    );
  }
}

