import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { FinanceService } from '../../services/finance.service';
import { Transaction, Category } from '../../models/transaction.model';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.css']
})
export class TransactionsComponent implements OnInit, OnDestroy {
  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  categories: Category[] = [];
  
  searchQuery: string = '';
  selectedType: string = 'all';
  selectedCategory: string = 'all';
  sortOption: string = 'date-desc';
  
  private subscription: Subscription | null = null;

  constructor(private financeService: FinanceService) {}

  ngOnInit(): void {
    this.categories = this.financeService.getCategories();
    
    this.subscription = this.financeService.getTransactions().subscribe(transactions => {
      this.transactions = transactions;
      this.applyFilters();
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  applyFilters(): void {
    // Filter by type
    let filtered = this.transactions.filter(transaction => {
      if (this.selectedType !== 'all' && transaction.type !== this.selectedType) {
        return false;
      }
      
      // Filter by category
      if (this.selectedCategory !== 'all' && transaction.category !== this.selectedCategory) {
        return false;
      }
      
      // Filter by search query
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        return transaction.description.toLowerCase().includes(query) || 
               transaction.category.toLowerCase().includes(query);
      }
      
      return true;
    });
    
    // Apply sorting
    filtered = this.sortTransactions(filtered);
    
    this.filteredTransactions = filtered;
  }

  sortTransactions(transactions: Transaction[]): Transaction[] {
    return [...transactions].sort((a, b) => {
      switch(this.sortOption) {
        case 'date-desc':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'date-asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'amount-desc':
          return b.amount - a.amount;
        case 'amount-asc':
          return a.amount - b.amount;
        default:
          return 0;
      }
    });
  }

  deleteTransaction(id: number): void {
    if (confirm('Are you sure you want to delete this transaction?')) {
      this.financeService.deleteTransaction(id);
    }
  }
}
