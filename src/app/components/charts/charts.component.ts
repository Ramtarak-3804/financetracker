import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsModule } from 'ngx-echarts';
import type { EChartsOption } from 'echarts';
import { Subscription } from 'rxjs';

import { FinanceService } from '../../services/finance.service';
import { Transaction } from '../../models/transaction.model';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-charts',
  standalone: true,
  imports: [CommonModule, NgxEchartsModule],
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.css']
})
export class ChartsComponent implements OnInit, OnDestroy {
  expenseChartOptions: EChartsOption = {};
  categoryPieOptions: EChartsOption = {};
  monthlyOptions: EChartsOption = {};
  
  private transactions: Transaction[] = [];
  private subscription: Subscription | null = null;
  private themeSubscription: Subscription | null = null;
  private currentTheme: 'light' | 'dark' = 'light';
  
  constructor(
    private financeService: FinanceService,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    // Subscribe to theme changes to update chart themes
    this.themeSubscription = this.themeService.currentTheme$.subscribe(theme => {
      this.currentTheme = theme;
      // Update charts when theme changes
      if (this.transactions.length > 0) {
        this.updateCharts();
      }
    });
    
    // Get transaction data
    this.subscription = this.financeService.getTransactions().subscribe(transactions => {
      this.transactions = transactions;
      this.updateCharts();
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.themeSubscription?.unsubscribe();
  }

  private updateCharts(): void {
    this.createExpenseHeatmapChart();
    this.createCategoryPieChart();
    this.createMonthlyBarChart();
  }
  
  /**
   * Create heatmap visualization of expenses by category and month
   * (Enhanced 2D alternative to 3D chart)
   */
  private createExpenseHeatmapChart(): void {
    // Group transactions by month and category
    const months: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const categories = this.financeService.getCategories().map(c => c.name);
    
    // Create data grid [month][category] = amount
    const data: number[][] = [];
    
    // Initialize with zeros
    for (let i = 0; i < 12; i++) {
      data.push(Array(categories.length).fill(0));
    }
    
    // Fill with actual expense data
    this.transactions
      .filter(t => t.type === 'expense')
      .forEach(transaction => {
        const monthIndex = new Date(transaction.date).getMonth();
        const categoryIndex = categories.indexOf(transaction.category);
        if (categoryIndex !== -1) {
          data[monthIndex][categoryIndex] += transaction.amount;
        }
      });
    
    // Transform data into format needed for heatmap
    const heatmapData: any[] = [];
    data.forEach((row, monthIndex) => {
      row.forEach((value, categoryIndex) => {
        heatmapData.push([
          monthIndex,
          categoryIndex,
          value > 0 ? value : '-'
        ]);
      });
    });
    
    const maxValue = this.getMaxAmount(heatmapData.filter(item => item[2] !== '-'));
    
    // Create visually appealing heatmap chart with 3D visual effect
    this.expenseChartOptions = {
      tooltip: {
        position: 'top',
        formatter: (params: any) => {
          const monthName = months[params.data[0]];
          const categoryName = categories[params.data[1]];
          const value = params.data[2];
          if (value === '-') {
            return `${monthName} · ${categoryName}<br/>No expenses`;
          }
          return `${monthName} · ${categoryName}<br/>₹${value.toFixed(2)}`;
        }
      },
      backgroundColor: this.currentTheme === 'dark' ? '#1e1e1e' : '#fff',
      grid: {
        top: '15%',
        left: '5%',
        right: '5%',
        bottom: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: months,
        splitArea: {
          show: true
        },
        axisLabel: {
          color: this.currentTheme === 'dark' ? '#e0e0e0' : '#333',
          fontWeight: 'bold'
        },
        axisLine: {
          lineStyle: {
            color: this.currentTheme === 'dark' ? '#555' : '#ccc'
          }
        }
      },
      yAxis: {
        type: 'category',
        data: categories,
        splitArea: {
          show: true
        },
        axisLabel: {
          color: this.currentTheme === 'dark' ? '#e0e0e0' : '#333',
          fontWeight: 'bold'
        },
        axisLine: {
          lineStyle: {
            color: this.currentTheme === 'dark' ? '#555' : '#ccc'
          }
        }
      },
      visualMap: {
        min: 0,
        max: maxValue,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: '5%',
        textStyle: {
          color: this.currentTheme === 'dark' ? '#e0e0e0' : '#333'
        },
        inRange: {
          color: ['#ebedf0', '#c6e48b', '#7bc96f', '#239a3b', '#196127']
        }
      },
      series: [{
        name: 'Expense Heat Map',
        type: 'heatmap',
        data: heatmapData,
        label: {
          show: true,
          formatter: (params: any) => {
            const value = params.data[2];
            return value === '-' ? '' : '₹' + value.toFixed(0);
          },
          color: this.currentTheme === 'dark' ? '#ffffff' : '#000000'
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }]
    };
  }
  
  /**
   * Create interactive pie chart for expense categories
   */
  private createCategoryPieChart(): void {
    // Get expense totals by category
    const categoryTotals = this.financeService.getCategoryTotals();
    
    this.categoryPieOptions = {
      backgroundColor: this.currentTheme === 'dark' ? '#1e1e1e' : '#fff',
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: ₹{c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        data: categoryTotals.map(c => c.category),
        textStyle: {
          color: this.currentTheme === 'dark' ? '#e0e0e0' : '#333'
        }
      },
      series: [
        {
          name: 'Expense Categories',
          type: 'pie',
          radius: ['30%', '70%'],
          center: ['60%', '50%'],
          roseType: 'radius',
          label: {
            color: this.currentTheme === 'dark' ? '#e0e0e0' : '#333'
          },
          emphasis: {
            focus: 'self',
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          data: categoryTotals.map(item => ({
            value: item.amount,
            name: item.category
          }))
        }
      ]
    };
  }
  
  /**
   * Create monthly income vs expense bar chart
   */
  private createMonthlyBarChart(): void {
    const months: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Initialize monthly data
    const monthlyIncomes = Array(12).fill(0);
    const monthlyExpenses = Array(12).fill(0);
    
    // Calculate monthly totals
    this.transactions.forEach(transaction => {
      const monthIndex = new Date(transaction.date).getMonth();
      if (transaction.type === 'income') {
        monthlyIncomes[monthIndex] += transaction.amount;
      } else {
        monthlyExpenses[monthIndex] += transaction.amount;
      }
    });
    
    this.monthlyOptions = {
      backgroundColor: this.currentTheme === 'dark' ? '#1e1e1e' : '#fff',
      title: {
        text: 'Monthly Income vs Expenses',
        left: 'center',
        textStyle: {
          color: this.currentTheme === 'dark' ? '#e0e0e0' : '#333'
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: (params: any) => {
          const month = params[0].name;
          let result = `<b>${month}</b><br>`;
          
          params.forEach((param: any) => {
            const colorSpan = `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${param.color};"></span>`;
            result += `${colorSpan}${param.seriesName}: ₹${param.value.toFixed(2)}<br>`;
          });
          
          return result;
        }
      },
      legend: {
        data: ['Income', 'Expense'],
        top: 'bottom',
        textStyle: {
          color: this.currentTheme === 'dark' ? '#e0e0e0' : '#333'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        top: '15%',
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          data: months,
          axisLine: {
            lineStyle: {
              color: this.currentTheme === 'dark' ? '#555' : '#ccc'
            }
          },
          axisLabel: {
            color: this.currentTheme === 'dark' ? '#e0e0e0' : '#333'
          }
        }
      ],
      yAxis: [
        {
          type: 'value',
          name: 'Amount (₹)',
          axisLine: {
            lineStyle: {
              color: this.currentTheme === 'dark' ? '#555' : '#ccc'
            }
          },
          axisLabel: {
            color: this.currentTheme === 'dark' ? '#e0e0e0' : '#333'
          },
          splitLine: {
            lineStyle: {
              color: this.currentTheme === 'dark' ? '#333' : '#eee'
            }
          }
        }
      ],
      series: [
        {
          name: 'Income',
          type: 'bar',
          stack: 'total',
          itemStyle: {
            color: 'rgb(76, 175, 80)'
          },
          emphasis: {
            focus: 'series'
          },
          data: monthlyIncomes
        },
        {
          name: 'Expense',
          type: 'bar',
          stack: 'total',
          itemStyle: {
            color: 'rgb(244, 67, 54)'
          },
          emphasis: {
            focus: 'series'
          },
          data: monthlyExpenses
        }
      ]
    };
  }
  
  private getMaxAmount(data: any[]): number {
    if (data.length === 0) return 100;
    return Math.max(...data.map(item => item[2])) || 100;
  }
}
