import {Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'calculadora-angular-18';
  displayValue: string = '';
  buttons: string[] = [
    '7', '8', '9', 'C',
    '4', '5', '6', '/',
    '1', '2', '3', '*',
    '0', '.', '=', '+',
    '-',
  ];

  onButtonClick(value: string): void {
    if (value === 'C') {
      this.displayValue = '';
    } else if (value === '=') {
      try {
        this.displayValue = eval(this.displayValue);
      } catch {
        this.displayValue = 'Error';
      }
    } else {
      this.displayValue += value;
    }
  }
}
