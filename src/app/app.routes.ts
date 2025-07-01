import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'calculadora',
    loadComponent: () => import('./pages/calculator/calculator.component').then(m => m.CalculatorComponent)
  }
];
