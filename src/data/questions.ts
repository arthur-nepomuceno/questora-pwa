import { Question } from '@/types/quiz';
import futebolQuestions from './futebol_100.json';
import novelasQuestions from './novelas-100.json';

export const questionsData: { [key: string]: Question[] } = {
  futebol: futebolQuestions as Question[],
  novelas: novelasQuestions as Question[]
};
