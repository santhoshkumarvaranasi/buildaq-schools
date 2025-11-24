import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FeeService } from '../fee.service';

@Component({
  selector: 'app-fee-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './fee-categories.html',
  styleUrls: ['../fees.scss']
})
export class FeeCategoriesComponent {
  categories: any[] = [];
  newCat: any = { name: '', description: '', type: 'Annual', status: 'active' };

  constructor(private fee: FeeService) {
    this.categories = this.fee.getFeeCategories();
  }

  addCategory() {
    if (!this.newCat.name) return alert('Name required');
    this.categories.push({ ...this.newCat, id: Date.now().toString() });
    this.newCat = { name: '', description: '', type: 'Annual', status: 'active' };
  }

  deleteCategory(id: string) {
    this.categories = this.categories.filter(c => c.id !== id);
  }
}
