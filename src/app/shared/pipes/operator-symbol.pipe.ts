import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'operatorSymbol',
  standalone: true
})
export class OperatorSymbolPipe implements PipeTransform {

  transform(operator: string): string {
    let transformed = '';

    [...operator].forEach((op) => {
      switch (op) {
        case '/':
          transformed += '\u00F7';
          break;
        case '-':
          transformed += '\u2212';
          break;
        case '*':
          transformed += '\u00D7';
          break;
        default:
          transformed += op;
          break;
      }
    });

    return transformed;
  }
}
