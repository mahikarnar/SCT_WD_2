class Calculator {
    constructor() {
        this.previousOperandElement = document.getElementById('previousOperand');
        this.currentOperandElement = document.getElementById('currentOperand');
        this.errorMessageElement = document.getElementById('errorMessage');
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = null;

        this.init();
    }
    
    init() {
        this.bindEvents();
        this.updateDisplay();
    }
    
    bindEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.matches('.btn')) {
                e.target.classList.add('pressed');
                setTimeout(() => e.target.classList.remove('pressed'), 100);
                
                const action = e.target.dataset.action;
                
                switch (action) {
                    case 'number':
                        this.inputNumber(e.target.dataset.number);
                        break;
                    case 'decimal':
                        this.inputDecimal();
                        break;
                    case 'operator':
                        this.inputOperator(e.target.dataset.operator);
                        break;
                    case 'calculate':
                        this.calculate();
                        break;
                    case 'clear':
                        this.clear();
                        break;
                    case 'delete':
                        this.delete();
                        break;
                }
            }
        });

        document.addEventListener('keydown', (e) => {
            this.handleKeyboardInput(e);
        });

        document.addEventListener('keydown', (e) => {
            if (['/', '*', '-', '+', '=', 'Enter'].includes(e.key)) {
                e.preventDefault();
            }
        });
    }
    
    // Handle keyboard input
    handleKeyboardInput(e) {
        const key = e.key;
        
        if (key >= '0' && key <= '9') {
            this.inputNumber(key);
            this.highlightButton(`[data-number="${key}"]`);
        }
        
        else if (key === '.') {
            this.inputDecimal();
            this.highlightButton('[data-decimal="."]');
        }
        
        else if (key === '+') {
            this.inputOperator('+');
            this.highlightButton('[data-operator="+"]');
        }
        else if (key === '-') {
            this.inputOperator('-');
            this.highlightButton('[data-operator="-"]');
        }
        else if (key === '*') {
            this.inputOperator('×');
            this.highlightButton('[data-operator="×"]');
        }
        else if (key === '/') {
            this.inputOperator('÷');
            this.highlightButton('[data-operator="÷"]');
        }
        else if (key === '%') {
            this.inputOperator('%');
            this.highlightButton('[data-operator="%"]');
        }

        else if (key === '=' || key === 'Enter') {
            this.calculate();
            this.highlightButton('[data-action="calculate"]');
        }
 
        else if (key === 'Escape' || key.toLowerCase() === 'c') {
            this.clear();
            this.highlightButton('[data-action="clear"]');
        }

        else if (key === 'Backspace' || key === 'Delete') {
            this.delete();
            this.highlightButton('[data-action="delete"]');
        }
    }
    
    highlightButton(selector) {
        const button = document.querySelector(selector);
        if (button) {
            button.classList.add('pressed');
            setTimeout(() => button.classList.remove('pressed'), 100);
        }
    }
    
    inputNumber(number) {
        try {
            if (this.waitingForOperand) {
                this.currentOperand = number;
                this.waitingForOperand = false;
            } else {
                this.currentOperand = this.currentOperand === '0' ? number : this.currentOperand + number;
            }
            
            // Limit length to prevent overflow
            if (this.currentOperand.length > 12) {
                this.showError('Number too long');
                return;
            }
            
            this.updateDisplay();
            this.clearError();
        } catch (error) {
            this.showError('Invalid number input');
        }
    }
    
    inputDecimal() {
        try {
            if (this.waitingForOperand) {
                this.currentOperand = '0.';
                this.waitingForOperand = false;
            } else if (this.currentOperand.indexOf('.') === -1) {
                this.currentOperand += '.';
            }
            
            this.updateDisplay();
            this.clearError();
        } catch (error) {
            this.showError('Invalid decimal input');
        }
    }
    
    inputOperator(nextOperator) {
        try {
            const inputValue = parseFloat(this.currentOperand);
            
            if (isNaN(inputValue)) {
                this.showError('Invalid number');
                return;
            }
            
            if (this.previousOperand === '') {
                this.previousOperand = this.currentOperand;
            } else if (this.operation) {
                const currentValue = parseFloat(this.currentOperand) || 0;
                const result = this.performCalculation();
                
                if (result === null) return;
                
                this.currentOperand = String(result);
                this.previousOperand = this.currentOperand;
            }
            
            this.waitingForOperand = true;
            this.operation = nextOperator;
            this.updateDisplay();
            this.clearError();
        } catch (error) {
            this.showError('Operator error');
        }
    }
    
    performCalculation() {
        try {
            const prev = parseFloat(this.previousOperand);
            const current = parseFloat(this.currentOperand);
            
            if (isNaN(prev) || isNaN(current)) {
                this.showError('Invalid numbers for calculation');
                return null;
            }
            
            let result;
            
            switch (this.operation) {
                case '+':
                    result = prev + current;
                    break;
                case '-':
                    result = prev - current;
                    break;
                case '×':
                    result = prev * current;
                    break;
                case '÷':
                    if (current === 0) {
                        this.showError('Cannot divide by zero');
                        return null;
                    }
                    result = prev / current;
                    break;
                case '%':
                    result = prev % current;
                    break;
                default:
                    this.showError('Unknown operation');
                    return null;
            }

            if (!isFinite(result)) {
                this.showError('Result is not a finite number');
                return null;
            }

            result = Math.round((result + Number.EPSILON) * 100000000) / 100000000;

            if (result.toString().length > 12) {
                if (result > 999999999999 || result < -999999999999) {
                    result = result.toExponential(6);
                } else {
                    result = parseFloat(result.toFixed(8));
                }
            }
            
            return result;
        } catch (error) {
            this.showError('Calculation error');
            return null;
        }
    }
    
    calculate() {
        try {
            if (this.operation && !this.waitingForOperand) {
                const result = this.performCalculation();
                
                if (result !== null) {
                    this.currentOperand = String(result);
                    this.previousOperand = '';
                    this.operation = null;
                    this.waitingForOperand = true;
                    this.updateDisplay();
                    this.clearError();
                }
            }
        } catch (error) {
            this.showError('Calculation failed');
        }
    }
    
    clear() {
        try {
            this.currentOperand = '0';
            this.previousOperand = '';
            this.operation = null;
            this.waitingForOperand = false;
            this.updateDisplay();
            this.clearError();
        } catch (error) {
            this.showError('Clear operation failed');
        }
    }
    
    delete() {
        try {
            if (this.currentOperand.length > 1) {
                this.currentOperand = this.currentOperand.slice(0, -1);
            } else {
                this.currentOperand = '0';
            }
            
            this.updateDisplay();
            this.clearError();
        } catch (error) {
            this.showError('Delete operation failed');
        }
    }
    
    updateDisplay() {
        try {
            this.currentOperandElement.textContent = this.formatNumber(this.currentOperand);

            if (this.operation) {
                this.previousOperandElement.textContent = 
                    `${this.formatNumber(this.previousOperand)} ${this.operation}`;
            } else {
                this.previousOperandElement.textContent = '';
            }
        } catch (error) {
            this.showError('Display update failed');
        }
    }
    
    formatNumber(number) {
        try {
            if (number === '') return '';
            
            const num = parseFloat(number);
            if (isNaN(num)) return number;

            if (Math.abs(num) > 999999999999) {
                return num.toExponential(6);
            }

            // Don't format decimal numbers
            if (number.includes('.')) {
                return number;
            } else {
                return this.formatIndianNumber(num);
            }
        } catch (error) {
            return number;
        }
    }

    // Format numbers according to Indian number system
    formatIndianNumber(num) {
        const isNegative = num < 0;
        const absNum = Math.abs(num).toString();
        
        if (Math.abs(num) < 1000) {
            return num.toString();
        }
        
        const numStr = absNum;
        const len = numStr.length;
        
        let formatted = '';
        
        // Indian number system: first comma after 3 digits from right, then every 2 digits
        for (let i = 0; i < len; i++) {
            const digit = numStr[i];
            const position = len - i;
            
            formatted += digit;
            
            if (position > 3 && (position - 3) % 2 === 1 && i < len - 1) {
                formatted += ',';
            } else if (position === 4 && i < len - 1) {
                formatted += ',';
            }
        }
        
        return isNegative ? '-' + formatted : formatted;
    }

    showError(message) {
        this.errorMessageElement.textContent = message;
        this.errorMessageElement.classList.add('show');
        
        // Auto-hide error after 3 seconds
        setTimeout(() => {
            this.clearError();
        }, 3000);
    }
    
    clearError() {
        this.errorMessageElement.classList.remove('show');
        setTimeout(() => {
            this.errorMessageElement.textContent = '';
        }, 300);
    }
}

// Input validation utilities
class InputParser {
    static isValidNumber(input) {
        return !isNaN(parseFloat(input)) && isFinite(input);
    }
    
    static sanitizeInput(input) {
        return input.toString().replace(/[^0-9.-]/g, '');
    }
    
    static parseExpression(expression) {
        try {
            const tokens = expression.match(/[+\-*/()0-9.]+/g);
            return tokens ? tokens.join('') : '';
        } catch (error) {
            return '';
        }
    }
}

// Error handling utilities  
class ErrorHandler {
    static logError(error, context = '') {
        console.error(`Calculator Error ${context}:`, error);
    }
    
    static handleDivisionByZero() {
        return 'Cannot divide by zero';
    }
    
    static handleInvalidInput() {
        return 'Invalid input';
    }
    
    static handleOverflow() {
        return 'Number too large';
    }
}

// Initialize calculator
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.calculator = new Calculator();
        console.log('Calculator initialized successfully');
    } catch (error) {
        console.error('Failed to initialize calculator:', error);
        document.body.innerHTML = '<div style="text-align: center; padding: 50px; color: red;">Calculator failed to load. Please refresh the page.</div>';
    }
});

document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && window.calculator) {
        window.calculator.updateDisplay();
    }
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Calculator, InputParser, ErrorHandler };
}