import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';

import { FinanceService } from '../../services/finance.service';
import { Transaction } from '../../models/transaction.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  totalIncome: number = 0;
  totalExpenses: number = 0;
  balance: number = 0;
  categoryTotals: { category: string, amount: number }[] = [];
  recentTransactions: Transaction[] = [];
  
  private subscription: Subscription | null = null;

  constructor(private financeService: FinanceService) {}

  ngOnInit(): void {
    this.subscription = this.financeService.getTransactions().subscribe(transactions => {
      this.totalIncome = this.financeService.getTotalIncome();
      this.totalExpenses = this.financeService.getTotalExpenses();
      this.balance = this.financeService.getBalance();
      this.categoryTotals = this.financeService.getCategoryTotals();
      
      // Get 5 most recent transactions
      this.recentTransactions = [...transactions]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  getPercentage(amount: number): number {
    const maxAmount = Math.max(...this.categoryTotals.map(c => c.amount), 1);
    return (amount / maxAmount) * 100;
  }
}
