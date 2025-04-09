import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { TransactionsComponent } from './components/transactions/transactions.component';
import { AddTransactionComponent } from './components/add-transaction/add-transaction.component';
import { ChartsComponent } from './components/charts/charts.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'transactions', component: TransactionsComponent },
  { path: 'add', component: AddTransactionComponent },
  { path: 'charts', component: ChartsComponent },
  { path: '**', redirectTo: '/dashboard' }
];
