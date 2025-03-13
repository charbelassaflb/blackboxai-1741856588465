// DOM Elements
const navButtons = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('.section');
const addTransactionBtn = document.getElementById('addTransactionBtn');
const transactionModal = document.getElementById('transactionModal');
const cancelTransactionBtn = document.getElementById('cancelTransaction');
const transactionForm = document.getElementById('transactionForm');
const transactionsTable = document.getElementById('transactionsTable');
const budgetForm = document.getElementById('budgetForm');

// Sample Data
let transactions = [
    { id: 1, date: '2024-01-15', type: 'expense', amount: 85.00, category: 'Food', description: 'Grocery Shopping' },
    { id: 2, date: '2024-01-14', type: 'income', amount: 3500.00, category: 'Salary', description: 'Monthly Salary' }
];

let budgets = {
    Housing: { limit: 1000, spent: 800 },
    Food: { limit: 500, spent: 450 },
    Transportation: { limit: 300, spent: 200 },
    Entertainment: { limit: 200, spent: 150 },
    Shopping: { limit: 300, spent: 220 }
};

// Navigation
navButtons.forEach(button => {
    button.addEventListener('click', () => {
        const sectionId = button.getAttribute('data-section');
        
        // Update active states
        navButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Show selected section
        sections.forEach(section => {
            section.classList.add('hidden');
            if (section.id === sectionId) {
                section.classList.remove('hidden');
                if (sectionId === 'reports') {
                    initializeCharts();
                }
            }
        });
    });
});

// Transaction Modal
addTransactionBtn.addEventListener('click', () => {
    transactionModal.classList.remove('hidden');
});

cancelTransactionBtn.addEventListener('click', () => {
    transactionModal.classList.add('hidden');
});

// Close modal when clicking outside
transactionModal.addEventListener('click', (e) => {
    if (e.target === transactionModal) {
        transactionModal.classList.add('hidden');
    }
});

// Handle Transaction Form Submit
transactionForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(transactionForm);
    const newTransaction = {
        id: transactions.length + 1,
        date: formData.get('date'),
        type: formData.get('type'),
        amount: parseFloat(formData.get('amount')),
        category: formData.get('category'),
        description: formData.get('description')
    };
    
    // Add to transactions array
    transactions.unshift(newTransaction);
    
    // Update UI
    updateTransactionsTable();
    updateDashboard();
    
    // Close modal and reset form
    transactionModal.classList.add('hidden');
    transactionForm.reset();
});

// Handle Budget Form Submit
budgetForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = new FormData(budgetForm);
    const category = formData.get('category');
    const amount = parseFloat(formData.get('amount'));
    
    if (category && amount) {
        budgets[category].limit = amount;
        updateBudgetDisplay();
    }
    
    budgetForm.reset();
});

// Update Transactions Table
function updateTransactionsTable() {
    transactionsTable.innerHTML = transactions.map(transaction => `
        <tr>
            <td class="px-6 py-4 whitespace-nowrap">${formatDate(transaction.date)}</td>
            <td class="px-6 py-4">${transaction.description}</td>
            <td class="px-6 py-4">${transaction.category}</td>
            <td class="px-6 py-4 ${transaction.type === 'income' ? 'text-green-500' : 'text-red-500'}">
                ${transaction.type === 'income' ? '+' : '-'}$${transaction.amount.toFixed(2)}
            </td>
            <td class="px-6 py-4">
                <button class="text-indigo-600 hover:text-indigo-900" onclick="editTransaction(${transaction.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="text-red-600 hover:text-red-900 ml-3" onclick="deleteTransaction(${transaction.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Update Budget Display
function updateBudgetDisplay() {
    Object.entries(budgets).forEach(([category, data]) => {
        const percentage = (data.spent / data.limit) * 100;
        const progressBar = document.querySelector(`#budget-${category} .progress-bar`);
        const amountText = document.querySelector(`#budget-${category} .amount-text`);
        
        if (progressBar && amountText) {
            progressBar.style.width = `${percentage}%`;
            amountText.textContent = `$${data.spent} / $${data.limit}`;
        }
    });
}

// Store chart instances
let expenseChart = null;
let trendChart = null;

// Initialize Charts
function initializeCharts() {
    // Destroy existing charts if they exist
    if (expenseChart) {
        expenseChart.destroy();
    }
    if (trendChart) {
        trendChart.destroy();
    }

    // Expense Breakdown Chart
    const expenseCtx = document.getElementById('expenseChart').getContext('2d');
    expenseChart = new Chart(expenseCtx, {
        type: 'pie',
        data: {
            labels: Object.keys(budgets),
            datasets: [{
                data: Object.values(budgets).map(b => b.spent),
                backgroundColor: [
                    '#4F46E5',
                    '#10B981',
                    '#F59E0B',
                    '#EF4444',
                    '#8B5CF6'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });

    // Monthly Trend Chart
    const trendCtx = document.getElementById('trendChart').getContext('2d');
    trendChart = new Chart(trendCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Income',
                data: [3500, 3500, 3500, 3500, 3500, 3500],
                borderColor: '#10B981',
                tension: 0.1
            }, {
                label: 'Expenses',
                data: [2100, 2300, 2000, 2400, 2260, 2500],
                borderColor: '#EF4444',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Helper Functions
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

function updateDashboard() {
    // Update dashboard statistics
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = totalIncome - totalExpenses;
    
    // Update UI elements
    document.querySelector('#dashboard .balance').textContent = `$${balance.toFixed(2)}`;
    document.querySelector('#dashboard .income').textContent = `$${totalIncome.toFixed(2)}`;
    document.querySelector('#dashboard .expenses').textContent = `$${totalExpenses.toFixed(2)}`;
}

// Delete Transaction
function deleteTransaction(id) {
    if (confirm('Are you sure you want to delete this transaction?')) {
        transactions = transactions.filter(t => t.id !== id);
        updateTransactionsTable();
        updateDashboard();
    }
}

// Edit Transaction
function editTransaction(id) {
    const transaction = transactions.find(t => t.id === id);
    if (transaction) {
        // Populate form with transaction data
        const form = document.getElementById('transactionForm');
        form.querySelector('[name="type"]').value = transaction.type;
        form.querySelector('[name="amount"]').value = transaction.amount;
        form.querySelector('[name="category"]').value = transaction.category;
        form.querySelector('[name="description"]').value = transaction.description;
        form.querySelector('[name="date"]').value = transaction.date;
        
        // Show modal
        transactionModal.classList.remove('hidden');
        
        // Update submit handler to update instead of create
        const submitHandler = (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const updatedTransaction = {
                ...transaction,
                type: formData.get('type'),
                amount: parseFloat(formData.get('amount')),
                category: formData.get('category'),
                description: formData.get('description'),
                date: formData.get('date')
            };
            
            // Update transaction in array
            transactions = transactions.map(t => 
                t.id === id ? updatedTransaction : t
            );
            
            // Update UI
            updateTransactionsTable();
            updateDashboard();
            
            // Close modal and reset form
            transactionModal.classList.add('hidden');
            form.reset();
            
            // Remove temporary submit handler
            form.removeEventListener('submit', submitHandler);
        };
        
        form.addEventListener('submit', submitHandler, { once: true });
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    updateTransactionsTable();
    updateDashboard();
    updateBudgetDisplay();
    initializeCharts();
});
