import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

import { FinanceService } from '../../services/finance.service';
import { Category, TransactionType } from '../../models/transaction.model';

@Component({
  selector: 'app-add-transaction',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './add-transaction.component.html',
  styleUrls: ['./add-transaction.component.css']
})
export class AddTransactionComponent implements OnInit {
  transactionForm!: FormGroup;
  categories: Category[] = [];
  today: string = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
  
  constructor(
    private fb: FormBuilder,
    private financeService: FinanceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.categories = this.financeService.getCategories();
    
    this.transactionForm = this.fb.group({
      type: ['expense', Validators.required],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      description: ['', [Validators.required, Validators.maxLength(100)]],
      category: ['', Validators.required],
      date: [this.today, Validators.required],
    });
  }

  setTransactionType(type: TransactionType): void {
    this.transactionForm.patchValue({ type });
  }

  onSubmit(): void {
    if (this.transactionForm.valid) {
      const formData = this.transactionForm.value;
      
      this.financeService.addTransaction({
        amount: Number(formData.amount),
        description: formData.description,
        category: formData.category,
        date: new Date(formData.date),
        type: formData.type
      });
      
      this.router.navigate(['/transactions']);
    } else {
      // Mark all fields as touched to trigger validation display
      Object.keys(this.transactionForm.controls).forEach(key => {
        const control = this.transactionForm.get(key);
        control?.markAsTouched();
      });
    }
  }
}
