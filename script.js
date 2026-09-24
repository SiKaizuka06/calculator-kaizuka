class Calculator {
    constructor() {
        this.previousDisplay = document.getElementById('previous-display');
        this.currentDisplay = document.getElementById('current-display');
        this.clear();
    }

    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
        this.shouldResetScreen = false;
    }

    delete() {
        if (this.currentOperand === '0') return;
        if (this.currentOperand.length === 1 || (this.currentOperand.length === 2 && this.currentOperand.startsWith('-'))) {
            this.currentOperand = '0';
        } else {
            this.currentOperand = this.currentOperand.toString().slice(0, -1);
        }
    }

    toggleSign() {
        if (this.currentOperand === '0') return;
        if (this.currentOperand.startsWith('-')) {
            this.currentOperand = this.currentOperand.slice(1);
        } else {
            this.currentOperand = '-' + this.currentOperand;
        }
    }

    percent() {
        const value = parseFloat(this.currentOperand);
        if (isNaN(value)) return;
        this.currentOperand = (value / 100).toString();
        this.adjustDisplay();
    }

    appendNumber(number) {
        if (number === '.' && this.currentOperand.includes('.')) return;
        if (this.shouldResetScreen) {
            this.currentOperand = '';
            this.shouldResetScreen = false;
        }
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number;
        } else {
            this.currentOperand += number;
        }
    }

    chooseOperation(operation) {
        if (this.currentOperand === '') return;
        if (this.previousOperand !== '' && !this.shouldResetScreen) {
            this.compute();
        }
        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.shouldResetScreen = true;
    }

    compute() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);
        if (isNaN(prev) || isNaN(current)) return;
        switch (this.operation) {
            case '+':
                computation = prev + current;
                break;
            case '-':
                computation = prev - current;
                break;
            case '*':
                computation = prev * current;
                break;
            case '/':
                if (current === 0) {
                    this.currentOperand = 'Error';
                    this.previousOperand = '';
                    this.operation = undefined;
                    return;
                }
                computation = prev / current;
                break;
            default:
                return;
        }
        this.currentOperand = computation.toString();
        this.adjustDisplay();
        this.operation = undefined;
        this.previousOperand = '';
    }

    adjustDisplay() {
        // Handle very long numbers
        const num = parseFloat(this.currentOperand);
        if (!isNaN(num) && this.currentOperand !== 'Error') {
            if (this.currentOperand.includes('.') && !this.currentOperand.includes('e')) {
                // Keep as is for decimal input
                return;
            }
            if (Math.abs(num) >= 1e16 || (Math.abs(num) < 1e-6 && num !== 0)) {
                this.currentOperand = num.toExponential(5);
            }
        }
    }

    getDisplayNumber(number) {
        if (number === '' || number === undefined) return '';
        if (number === 'Error') return 'Error';
        
        const stringNumber = number.toString();
        
        // If it's in scientific notation, return as is
        if (stringNumber.includes('e')) return stringNumber;
        
        const integerDigits = parseFloat(stringNumber.split('.')[0]);
        const decimalDigits = stringNumber.split('.')[1];
        
        let integerDisplay;
        if (isNaN(integerDigits)) {
            integerDisplay = '';
        } else {
            integerDisplay = integerDigits.toLocaleString('en-US', { maximumFractionDigits: 0 });
        }
        
        if (decimalDigits != null) {
            return `${integerDisplay}.${decimalDigits}`;
        } else {
            return integerDisplay;
        }
    }

    updateDisplay() {
        this.currentDisplay.innerText = this.getDisplayNumber(this.currentOperand);
        
        // Dynamic font size based on content length
        const length = this.currentDisplay.innerText.length;
        if (length > 9) {
            this.currentDisplay.style.fontSize = '48px';
        } else if (length > 7) {
            this.currentDisplay.style.fontSize = '56px';
        } else {
            this.currentDisplay.style.fontSize = '';
        }
        
        if (this.operation != null) {
            const opSymbol = { '+': '+', '-': '−', '*': '×', '/': '÷' }[this.operation];
            this.previousDisplay.innerText = `${this.getDisplayNumber(this.previousOperand)} ${opSymbol}`;
        } else {
            this.previousDisplay.innerText = '';
        }
    }
}

const calculator = new Calculator();

// Number buttons
document.querySelectorAll('.number').forEach(button => {
    button.addEventListener('click', () => {
        calculator.appendNumber(button.innerText);
        calculator.updateDisplay();
        removeOperatorActive();
    });
});

// Decimal button
document.getElementById('decimal').addEventListener('click', () => {
    calculator.appendNumber('.');
    calculator.updateDisplay();
    removeOperatorActive();
});

// Operator buttons
document.querySelectorAll('.operator').forEach(button => {
    button.addEventListener('click', () => {
        calculator.chooseOperation(button.dataset.operator);
        calculator.updateDisplay();
        removeOperatorActive();
        button.classList.add('active');
    });
});

// Equals button
document.getElementById('equals').addEventListener('click', () => {
    calculator.compute();
    calculator.updateDisplay();
    removeOperatorActive();
});

// Clear (AC) button
document.getElementById('clear').addEventListener('click', () => {
    calculator.clear();
    calculator.updateDisplay();
    removeOperatorActive();
});

// Delete one digit button
document.getElementById('backspace').addEventListener('click', () => {
    calculator.delete();
    calculator.updateDisplay();
});

// Percent button
document.getElementById('percent').addEventListener('click', () => {
    calculator.percent();
    calculator.updateDisplay();
});

// Remove active class from all operators
function removeOperatorActive() {
    document.querySelectorAll('.operator').forEach(btn => {
        btn.classList.remove('active');
    });
}

// Keyboard support
document.addEventListener('keydown', (e) => {
    if (e.key >= '0' && e.key <= '9') {
        calculator.appendNumber(e.key);
        calculator.updateDisplay();
        removeOperatorActive();

    } else if (e.key === '.') {
        calculator.appendNumber('.');
        calculator.updateDisplay();

    } else if (e.key === '+') {
        calculator.chooseOperation('+');
        calculator.updateDisplay();
        removeOperatorActive();
        highlightOperator('+');

    } else if (e.key === '-') {
        calculator.chooseOperation('-');
        calculator.updateDisplay();
        removeOperatorActive();
        highlightOperator('-');

    } else if (e.key === '*') {
        calculator.chooseOperation('*');
        calculator.updateDisplay();
        removeOperatorActive();
        highlightOperator('*');

    } else if (e.key === '/') {
        e.preventDefault();
        calculator.chooseOperation('/');
        calculator.updateDisplay();
        removeOperatorActive();
        highlightOperator('/');

    } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        calculator.compute();
        calculator.updateDisplay();
        removeOperatorActive();

    } else if (e.key === 'Backspace') {
        calculator.delete();
        calculator.updateDisplay();
        
    } else if (e.key === 'Escape') {
        calculator.clear();
        calculator.updateDisplay();
        removeOperatorActive();
        
    } else if (e.key === '%') {
        calculator.percent();
        calculator.updateDisplay();
    }
});

function highlightOperator(op) {
    document.querySelectorAll('.operator').forEach(btn => {
        if (btn.dataset.operator === op) {
            btn.classList.add('active');
        }
    });
}