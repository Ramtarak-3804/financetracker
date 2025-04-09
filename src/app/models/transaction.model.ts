export interface Transaction {
  id: number;
  amount: number;
  description: string;
  category: string;
  date: Date;
  type: 'income' | 'expense';
}

export type TransactionType = 'income' | 'expense';

export interface Category {
  id: number;
  name: string;
}