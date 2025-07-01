import {Component, OnInit, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {MatCardModule} from "@angular/material/card";
import {FormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {MatInputModule} from "@angular/material/input";
import {MatButton, MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {MatDivider} from "@angular/material/divider";
import {MatGridList, MatGridTile} from "@angular/material/grid-list";
import {RippleRef} from "@angular/material/core";
import {MatSnackBar} from "@angular/material/snack-bar";
import {OperatorSymbolPipe} from "../../shared/pipes/operator-symbol.pipe";
import {evaluate} from "mathjs";

const OPERATORS: RegExp = /[-+*^\/]/;

@Component({
  selector: 'app-calculator',
  standalone: true,
  imports: [
    MatCardModule,
    FormsModule,
    CommonModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDivider,
    MatGridList,
    MatGridTile,
    OperatorSymbolPipe
  ],
  providers: [
    OperatorSymbolPipe
  ],
  templateUrl: './calculator.component.html',
  styleUrl: './calculator.component.scss'
})
export class CalculatorComponent implements OnInit{
  summary: string = ''; // Inicialización
  expression: string = '0'; // Inicialización
  rippleRef: RippleRef | undefined = undefined; // Inicialización

  @ViewChild('backspace') backspace!: MatButton;
  @ViewChildren(MatButton) matBtns!: QueryList<MatButton>;
  constructor(
    private snackBar: MatSnackBar,
    private opPipe: OperatorSymbolPipe
  ) {}

  ngOnInit() {
    this.clearDisplay();
  }

  //En casi de ser requerido
  // @HostListener('document:keyup', ['$event.key'])
  // onKeyUp(key: string) {
  //   if (+key >= 0 && +key <= 9) {
  //     this.onNumClicked(key);
  //   } else if (key.match(OPERATORS)) {
  //     this.onOpClicked(key);
  //   } else if (key === '=') {
  //     this.onEqualsClicked();
  //   } else if (key === '.') {
  //     this.onDecimalClicked();
  //   } else if (key === 'Backspace') {
  //     this.onBackSpaceClicked();
  //   } else if (key === '(' || key === ')') {
  //     if (this.expression === '0' && key === '(') {
  //       this.expression = this.expression.slice(0, -1) + '(';
  //     } else {
  //       this.expression += key;
  //     }
  //   } else if (key.toUpperCase() === 'AC') {
  //     key = 'AC';
  //     this.clearDisplay();
  //   }
  //
  //   this.rippleRef?.fadeOut();
  // }

  // Funciones extras en caso de ser requeridas
  // @HostListener('document:keydown', ['$event.key', '$event.repeat', '$event'])
  // onKeyDown(key: string, repeat: boolean, e: any) {
  //   if (repeat) {
  //     // Stop browser going back
  //     if (key === 'Backspace') {
  //       e.preventDefault();
  //     }
  //   } else {
  //     this.rippleRef?.fadeOut(); // Asegúrate de que `rippleRef` sea de tipo `RippleRef`
  //
  //     const conf: RippleConfig = { centered: true, persistent: true };
  //
  //     if (key === 'Backspace') {
  //       // Aquí te aseguras de que `rippleRef` esté correctamente asignado como `RippleRef`
  //       this.rippleRef = this.backspace.ripple.launch(conf);
  //       e.preventDefault();
  //     } else {
  //       const isOp: boolean = !!key.match(OPERATORS);
  //       key = key.toUpperCase();
  //
  //       // Busca el botón correspondiente y lanza el efecto ripple
  //       const button = this.matBtns.find((btn) => {
  //         const text = btn._elementRef.nativeElement.textContent;
  //         return text === (isOp ? this.opPipe.transform(key) : key);
  //       });
  //
  //       if (button) {
  //         this.rippleRef = button.ripple.launch(conf); // Lanzamos el efecto ripple
  //       }
  //     }
  //   }
  // }

  /**
   * Maneja el evento de clic en los botones numéricos de la calculadora.
   *
   * Esta función agrega el número clickeado a la expresión actual. Si el último número
   * en la expresión es '0', lo reemplaza con el nuevo número para evitar ceros a la izquierda.
   *
   * @param {string} num - El número clickeado por el usuario (por ejemplo, '1', '2', '3', etc.).
   *
   * @example
   * // Si la expresión actual es "5 + 0" y el usuario hace clic en '3':
   * onNumClicked('3'); // Actualiza la expresión a "5 + 3"
   *
   * @example
   * // Si la expresión actual es "10" y el usuario hace clic en '0':
   * onNumClicked('0'); // Actualiza la expresión a "100"
   *
   * @example
   * // Si la expresión actual es "0" y el usuario hace clic en '5':
   * onNumClicked('5'); // Actualiza la expresión a "5"
   */
  onNumClicked(num: string) {
    // El último número(s) que sigue a un operador
    const lastNum = this.expression.split(OPERATORS).pop();

    if (lastNum === '0') {
      // Evita números con ceros a la izquierda
      this.expression = this.expression.slice(0, -1) + num;
    } else {
      this.expression += num;
    }
  }

  /**
   * Maneja el evento de clic en los botones de operadores de la calculadora.
   *
   * Esta función agrega el operador clickeado a la expresión actual. Si el último carácter
   * de la expresión es otro operador o un punto decimal, lo reemplaza con el nuevo operador.
   * Además, si el operador es '%', lo convierte en una multiplicación por porcentaje ('%*').
   *
   * @param {string} operator - El operador clickeado por el usuario (por ejemplo, '+', '-', '*', '/', '%', etc.).
   *
   * @example
   * // Si la expresión actual es "5 +" y el usuario hace clic en '*':
   * onOpClicked('*'); // Actualiza la expresión a "5 *"
   *
   * @example
   * // Si la expresión actual es "10." y el usuario hace clic en '+':
   * onOpClicked('+'); // Actualiza la expresión a "10+"
   *
   * @example
   * // Si la expresión actual es "20" y el usuario hace clic en '%':
   * onOpClicked('%'); // Actualiza la expresión a "20%*"
   */
  onOpClicked(operator: string) {
    const last = this.expression[this.expression.length - 1];

    // Si el operador es '%', lo reemplazamos por 'x' (multiplicación)
    if (operator === '%') {
      operator = '%*';
    }

    // Si el último carácter es un operador o un punto decimal, reemplazamos el operador
    if (last.match(OPERATORS) || last === '.') {
      this.expression = this.expression.slice(0, -1) + operator;
    } else {
      this.expression += operator;
    }
  }

  /**
   * Maneja el evento de clic en el botón del punto decimal de la calculadora.
   *
   * Esta función agrega un punto decimal al último número de la expresión actual, siempre y cuando:
   * 1. El último carácter de la expresión no sea un operador.
   * 2. El último número no contenga ya un punto decimal.
   *
   * @example
   * // Si la expresión actual es "5" y el usuario hace clic en '.':
   * onDecimalClicked(); // Actualiza la expresión a "5."
   *
   * @example
   * // Si la expresión actual es "5 + 3" y el usuario hace clic en '.':
   * onDecimalClicked(); // Actualiza la expresión a "5 + 3."
   *
   * @example
   * // Si la expresión actual es "5." y el usuario hace clic en '.':
   * onDecimalClicked(); // No hace nada, ya que el último número ya tiene un punto decimal.
   *
   * @example
   * // Si la expresión actual es "5 +" y el usuario hace clic en '.':
   * onDecimalClicked(); // No hace nada, ya que el último carácter es un operador.
   */
  onDecimalClicked() {
    // El último número(s) que sigue a un operador
    const lastNum = this.expression.split(OPERATORS).pop();

    if (
      !this.expression[this.expression.length - 1].match(OPERATORS) &&
      lastNum && !lastNum.includes('.')
    ) {
      this.expression += '.';
    }
  }


  /**
   * Maneja el evento de clic en el botón de retroceso (backspace) de la calculadora.
   *
   * Esta función elimina el último carácter de la expresión actual. Si la expresión
   * solo tiene un carácter, se llama a la función `clearDisplay` para borrar completamente
   * la expresión.
   *
   * @example
   * // Si la expresión actual es "123" y el usuario hace clic en backspace:
   * onBackSpaceClicked(); // Actualiza la expresión a "12"
   *
   * @example
   * // Si la expresión actual es "5 + 3" y el usuario hace clic en backspace:
   * onBackSpaceClicked(); // Actualiza la expresión a "5 + "
   *
   * @example
   * // Si la expresión actual es "7" y el usuario hace clic en backspace:
   * onBackSpaceClicked(); // Llama a `clearDisplay()` y borra la expresión.
   */
  onBackSpaceClicked() {
    if (this.expression.length === 1) {
      // Si la expresión solo tiene un carácter, se borra completamente
      this.clearDisplay();
    } else {
      // Elimina el último carácter de la expresión
      this.expression = this.expression.slice(0, -1);
    }
  }

  /**
   * Maneja el evento de clic en el botón de igual (=) de la calculadora.
   *
   * Esta función evalúa la expresión actual si cumple con las siguientes condiciones:
   * 1. El último carácter de la expresión no es un operador ni un punto decimal.
   * 2. Los paréntesis en la expresión están balanceados (si los hay).
   *
   * Si la expresión es válida, se evalúa y el resultado se muestra en la pantalla.
   * Si la expresión es inválida (por ejemplo, paréntesis desbalanceados o división por cero),
   * se muestra un mensaje de error.
   *
   * @example
   * // Si la expresión actual es "5 + 3" y el usuario hace clic en '=':
   * onEqualsClicked(); // Evalúa la expresión y muestra "8".
   *
   * @example
   * // Si la expresión actual es "5 +" y el usuario hace clic en '=':
   * onEqualsClicked(); // No hace nada, ya que el último carácter es un operador.
   *
   * @example
   * // Si la expresión actual es "5 / 0" y el usuario hace clic en '=':
   * onEqualsClicked(); // Muestra un mensaje de error por división por cero.
   *
   * @example
   * // Si la expresión actual es "(5 + 3" y el usuario hace clic en '=':
   * onEqualsClicked(); // Muestra un mensaje de error por paréntesis desbalanceados.
   */
  onEqualsClicked() {
    const last = this.expression[this.expression.length - 1];

    // Verifica que el último carácter no sea un operador ni un punto decimal
    if (!(last.match(OPERATORS) || last === '.')) {
      // Guarda la expresión actual en el resumen
      this.summary = this.expression;

      // Verifica si los paréntesis están balanceados
      if (!this.checkParens()) {
        this.invalidExpression('Unbalanced Parentheses'); // Muestra error si no están balanceados
        return;
      }

      try {
        // Evalúa la expresión
        const ans = evaluate(this.expression);

        // Verifica si el resultado es un número finito
        if (isFinite(ans)) {
          this.expression = ans.toString(); // Muestra el resultado
        } else {
          this.invalidExpression(ans); // Muestra error si el resultado no es finito
        }
      } catch (e) {
        this.invalidExpression(); // Muestra error si ocurre una excepción al evaluar
      }
    }
  }

  /**
   * Verifica si los paréntesis en la expresión actual están balanceados (En caso de usarse esta listo segun yo JAJA).
   *
   * Esta función recorre la expresión y utiliza una pila para asegurarse de que cada
   * paréntesis de apertura '(' tenga un paréntesis de cierre ')' correspondiente.
   *
   * @returns {boolean} - `true` si los paréntesis están balanceados, `false` si no lo están.
   *
   * @example
   * // Si la expresión es "(5 + 3)":
   * checkParens(); // Devuelve `true`.
   *
   * @example
   * // Si la expresión es "(5 + 3":
   * checkParens(); // Devuelve `false`.
   *
   * @example
   * // Si la expresión es "5 + 3)":
   * checkParens(); // Devuelve `false`.
   *
   * @example
   * // Si la expresión es "(5 + (3 * 2))":
   * checkParens(); // Devuelve `true`.
   */
  checkParens(): boolean {
    const parenStack: string[] = []; // Pila para rastrear paréntesis de apertura

    // Recorre cada carácter de la expresión
    for (const value of [...this.expression]) {
      if (value === '(') {
        // Si encuentra un '(', lo agrega a la pila
        parenStack.push(value);
      } else if (value === ')') {
        // Si encuentra un ')', verifica si hay un '(' correspondiente en la pila
        if (parenStack.length > 0) {
          parenStack.pop(); // Elimina el '(' correspondiente de la pila
        } else {
          // Si no hay '(' correspondiente, los paréntesis no están balanceados
          return false;
        }
      }
    }

    // Si la pila está vacía, los paréntesis están balanceados
    return parenStack.length === 0;
  }

  /**
   * Maneja una expresión inválida en la calculadora.
   *
   * Esta función restablece la expresión actual a '0' y muestra un mensaje de error
   * en una barra de notificaciones (snackbar). El mensaje de error puede incluir
   * una descripción adicional proporcionada por el parámetro `errMsg`.
   *
   * @param {string} [errMsg] - Mensaje de error opcional que describe la razón de la invalidación.
   *
   * @example
   * // Si la expresión es inválida y no se proporciona un mensaje de error:
   * invalidExpression(); // Muestra "Expresión inválida" en la snackbar.
   *
   * @example
   * // Si la expresión es inválida debido a paréntesis desbalanceados:
   * invalidExpression('Paréntesis desbalanceados'); // Muestra "Expresión inválida: Paréntesis desbalanceados" en la snackbar.
   *
   * @example
   * // Si la expresión es inválida debido a una división por cero:
   * invalidExpression('División por cero'); // Muestra "Expresión inválida: División por cero" en la snackbar.
   */
  invalidExpression(errMsg?: string) {
    // Restablece la expresión a '0'
    this.expression = '0';

    // Muestra un mensaje de error en la snackbar
    this.snackBar.open(
      `Expresión inválida${errMsg ? ': ' + errMsg : ''}`, // Mensaje de error
      undefined, // Texto del botón de acción (no se usa aquí)
      {
        duration: 3000,
        verticalPosition: 'bottom',
      }
    );
  }

  clearDisplay() {
    this.expression = '0';
    this.summary = '';
  }
}
