import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Transaction, Category } from '../models/transaction.model';

@Injectable({
  providedIn: 'root'
})
export class FinanceService {
  private transactions: Transaction[] = [];
  private transactionsSubject = new BehaviorSubject<Transaction[]>([]);
  
  private categories: Category[] = [
    { id: 1, name: 'Food' },
    { id: 2, name: 'Transportation' },
    { id: 3, name: 'Housing' },
    { id: 4, name: 'Utilities' },
    { id: 5, name: 'Entertainment' },
    { id: 6, name: 'Healthcare' },
    { id: 7, name: 'Salary' },
    { id: 8, name: 'Investment' },
    { id: 9, name: 'Other' }
  ];

  constructor() {
    // Load transactions from localStorage if available
    const savedTransactions = localStorage.getItem('transactions');
    if (savedTransactions) {
      this.transactions = JSON.parse(savedTransactions).map((t: any) => ({
        ...t,
        date: new Date(t.date)
      }));
      this.transactionsSubject.next([...this.transactions]);
    }
  }

  getTransactions(): Observable<Transaction[]> {
    return this.transactionsSubject.asObservable();
  }

  addTransaction(transaction: Omit<Transaction, 'id'>): void {
    const newTransaction: Transaction = {
      ...transaction,
      id: this.generateId()
    };
    
    this.transactions.push(newTransaction);
    this.updateTransactions();
  }

  updateTransaction(transaction: Transaction): void {
    const index = this.transactions.findIndex(t => t.id === transaction.id);
    if (index !== -1) {
      this.transactions[index] = transaction;
      this.updateTransactions();
    }
  }

  deleteTransaction(id: number): void {
    this.transactions = this.transactions.filter(t => t.id !== id);
    this.updateTransactions();
  }

  getCategories(): Category[] {
    return [...this.categories];
  }

  getTotalIncome(): number {
    return this.transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  getTotalExpenses(): number {
    return this.transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  getBalance(): number {
    return this.getTotalIncome() - this.getTotalExpenses();
  }

  getCategoryTotals(): { category: string, amount: number }[] {
    const categoryMap = new Map<string, number>();
    
    this.transactions.forEach(transaction => {
      const currentAmount = categoryMap.get(transaction.category) || 0;
      const amountToAdd = transaction.type === 'expense' ? transaction.amount : 0;
      categoryMap.set(transaction.category, currentAmount + amountToAdd);
    });
    
    return Array.from(categoryMap.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  }

  private updateTransactions(): void {
    this.transactionsSubject.next([...this.transactions]);
    localStorage.setItem('transactions', JSON.stringify(this.transactions));
  }

  private generateId(): number {
    return this.transactions.length > 0
      ? Math.max(...this.transactions.map(t => t.id)) + 1
      : 1;
  }
}
