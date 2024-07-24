import './basic.scss';
import './style.scss';

type MortgageType = 'repayment' | 'interest-only';

interface MortgageResult {
  monthlyRepayment: string;
  totalRepayment: string;
}

function calculateMortgage(amount: number, term: number, rate: number, type: MortgageType): MortgageResult {
  // Convert rate to decimal
  const rateDecimal = rate / 100;

  // Calculate monthly interest rate
  const monthlyRate = rateDecimal / 12;

  // Calculate number of payments
  const numberOfPayments = term * 12;

  // Calculate mortgage
  let mortgage: number;
  if (type === 'repayment') {
    mortgage =
      (amount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  } else if (type === 'interest-only') {
    mortgage = amount * monthlyRate;
  } else {
    throw new Error('Invalid mortgage type');
  }

  const monthlyRepayment = mortgage.toFixed(2);
  const totalRepayment = (mortgage * numberOfPayments).toFixed(2);

  // Format currency for better readability
  const formattedMonthlyRepayment = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(parseFloat(monthlyRepayment));
  const formattedTotalRepayment = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(parseFloat(totalRepayment));

  return {
    monthlyRepayment: formattedMonthlyRepayment,
    totalRepayment: formattedTotalRepayment,
  };
}

function main() {
  function removeAllErrorClasses() {
    const formGroups = document.querySelectorAll('.form-group');
    formGroups.forEach((formGroup) => formGroup.classList.remove('error'));
  }

  function resetValues() {
    if (monthlyRepayment && totalRepayment) {
      monthlyRepayment.textContent = '£0';
      totalRepayment.textContent = '£0';
    }
  }

  function clearAllInputs() {
    // Clear number inputs
    if (mortgageAmount && mortgageTerm && interestRate) {
      mortgageAmount.value = '';
      mortgageTerm.value = '';
      interestRate.value = '';
    }

    // Clear radio inputs
    if (repaymentRadio && interestOnlyRadio) {
      repaymentRadio.checked = false;
      interestOnlyRadio.checked = false;
      repaymentRadio.parentElement?.classList.remove('active');
      interestOnlyRadio.parentElement?.classList.remove('active');
    }

    // Remove error classes
    removeAllErrorClasses();
  }

  function checkFormInputs() {
    const inputs: HTMLInputElement[] = [mortgageAmount, mortgageTerm, interestRate].filter(Boolean) as HTMLInputElement[];
    const emptyInputs = inputs.filter((input) => input.value === '');

    // Check if either repaymentRadio or interestOnlyRadio is selected
    if (!repaymentRadio.checked && !interestOnlyRadio.checked) {
      emptyInputs.push(repaymentRadio); // Push one of the radio buttons to indicate the error
    }

    return emptyInputs;
  }

  function addErrorClass(input: HTMLInputElement) {
    const parentWrapper = input.parentElement;
    const parentFormGroup = parentWrapper?.parentElement;
    parentFormGroup?.classList.add('error');
  }

  // # DOM elements

  // ## Form input elements
  const form = document.querySelector('form') as HTMLFormElement;
  const mortgageAmount = document.querySelector('#mortgage-amount') as HTMLInputElement;
  const mortgageTerm = document.querySelector('#mortgage-term') as HTMLInputElement;
  const interestRate = document.querySelector('#interest-rate') as HTMLInputElement;
  const repaymentRadio = document.querySelector('#repayment') as HTMLInputElement;
  const interestOnlyRadio = document.querySelector('#interest-only') as HTMLInputElement;

  function showEmptyResultsElements() {
    const resultsContainer = document.querySelector('.empty-results') as HTMLElement;

    // remove hidden attribute
    resultsContainer.removeAttribute('hidden');
  }

  function hideEmptyResultsElements() {
    const resultsContainer = document.querySelector('.empty-results') as HTMLElement;

    // add hidden attribute
    resultsContainer.setAttribute('hidden', '');
  }

  function showCompleteResultsElements() {
    const resultsContainer = document.querySelector('.completed-results') as HTMLElement;

    // remove hidden attribute
    resultsContainer.removeAttribute('hidden');
  }

  function hideCompleteResultsElements() {
    const resultsContainer = document.querySelector('.completed-results') as HTMLElement;

    // add hidden attribute
    resultsContainer.setAttribute('hidden', '');
  }


  // ## Buttons
  const clearAllButton = document.querySelector('#clear-all') as HTMLButtonElement;
  clearAllButton?.addEventListener('click', () => {
    clearAllInputs();
    resetValues();
    hideCompleteResultsElements();
    showEmptyResultsElements();
  });

  // ## Results elements
  const monthlyRepayment = document.querySelector('#monthly-repayment') as HTMLElement;
  const totalRepayment = document.querySelector('#total-repayment') as HTMLElement;

  //# Handle radio inputs style changes
  repaymentRadio?.addEventListener('click', () => {
    repaymentRadio.parentElement?.classList.add('active');
    interestOnlyRadio.parentElement?.classList.remove('active');
  });

  interestOnlyRadio?.addEventListener('click', () => {
    interestOnlyRadio.parentElement?.classList.add('active');
    repaymentRadio.parentElement?.classList.remove('active');
  });

  //# Handle form submission
  function handleFormSubmit(e: Event) {
    e.preventDefault();
    const emptyInputs = checkFormInputs();
    if (emptyInputs.length > 0) {
      emptyInputs.forEach((input) => addErrorClass(input));
      return;
    }

    // Get form values
    let amount = mortgageAmount.value.replace(/,/g, ''); // Remove commas first
    const amountNumber = parseFloat(amount);
    const term = parseFloat(mortgageTerm.value);
    const rate = parseFloat(interestRate.value);
    const type: MortgageType = repaymentRadio.checked ? 'repayment' : 'interest-only';

    const { monthlyRepayment: monthly, totalRepayment: total } = calculateMortgage(amountNumber, term, rate, type);

    // Display results
    if (monthlyRepayment && totalRepayment) {
      monthlyRepayment.textContent = `${monthly}`;
      totalRepayment.textContent = `${total}`;

      // Show results elements
      hideEmptyResultsElements();
      showCompleteResultsElements();
    }

    clearAllInputs();
  }

  form?.addEventListener('submit', handleFormSubmit);

  // Handle mortgage amount input (add commas)
  mortgageAmount?.addEventListener('input', function (e: Event) {
    const target = e.target as HTMLInputElement;

    // Prevent user from entering non-numeric characters
    const value = target.value.replace(/[^0-9]/g, ''); // Only allow numeric characters

    // Format the number with commas
    const formattedValue = new Intl.NumberFormat('en-GB').format(parseFloat(value));
    target.value = formattedValue;

    // Remove error class
    const parentWrapper = target.closest('.form-group');
    if (parentWrapper?.classList.contains('error')) {
      parentWrapper.classList.remove('error');
    }
  });
}

window.addEventListener('load', () => {
  const loadingSpinner = document.getElementById('loading-spinner');
  const app = document.getElementById('app');
  if (loadingSpinner && app) {
    loadingSpinner.style.display = 'none';
    app.style.display = 'block';
  }
  
  // Ejecuta la función main después de asegurar que los estilos se han aplicado
  document.addEventListener('DOMContentLoaded', main);
});
