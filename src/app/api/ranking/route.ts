import { NextResponse } from 'next/server';
// import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
// import { db } from '@/lib/firebase';
import { adminDb } from '@/lib/firebase-admin';

// Interfaces
interface RankingUser {
  id: string;
  name: string;
  totalPoints: number;
}

interface CacheData {
  data: RankingUser[];
  lastUpdate: Date;
  nextUpdate: Date;
}

// Cache em memória
let rankingCache: CacheData | null = null;

// Horários de atualização (em horas UTC)
const UPDATE_HOURS = [8, 14, 20];

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
    // const usersRef = collection(db, 'users');
    // const q = query(usersRef, orderBy('totalPoints', 'desc'), limit(50));
    // const querySnapshot = await getDocs(q);

    const querySnapshot = await adminDb
      .collection('users')
      .orderBy('totalPoints', 'desc')
      .limit(50)
      .get();
    
    const rankingData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
      totalPoints: doc.data().totalPoints
    }));
    
    console.log('Dados do ranking:', rankingData);
    return rankingData;
  } catch (error) {
    console.error('Erro ao buscar ranking:', error);
    return [];
  }
}

export async function GET() {
  try {
    // Verifica se o cache precisa ser atualizado
    if (shouldUpdateCache()) {
      // Cache inválido ou não existe - buscar novos dados
      const data = await fetchRankingFromFireStore();
      
      // Atualizar o cache
      rankingCache = {
        data,
        lastUpdate: new Date(),
        nextUpdate: getNextUpdateTime()
      };
      
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
      return NextResponse.json(
        { error: 'Cache não disponível' },
        { status: 500 }
      );
    }
    
    // Cache válido - retornar dados do cache
    return NextResponse.json({
      data: rankingCache.data,
      lastUpdate: rankingCache.lastUpdate,
      nextUpdate: rankingCache.nextUpdate,
      rankingCameFromCached: true
    });
  } catch (error) {
    console.error('Erro na API de ranking:', error);
    return NextResponse.json(
      { error: 'Erro ao processar requisição' },
      { status: 500 }
    );
  }
}

