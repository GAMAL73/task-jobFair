document.addEventListener('DOMContentLoaded', function() {
    const dataTable = document.getElementById('dataTable');
    const dataBody = document.getElementById('dataBody');
    const filterInput = document.getElementById('filterInput');
    const submit = document.getElementById('button');
    const filterAmountInput = document.getElementById('filterAmountInput');
    const ctx = document.getElementById('transactionChart').getContext('2d');
    let chart;

    let customers = [];
    let transactions = [];

    // Fetch data from data.json
    fetch('js/data.json')
        .then(response => response.json())
        .then(data => {
            customers = data.customers;
            transactions = data.transactions;
            
            // Display initial data in the table
            displayTable(customers, transactions);
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });

    // Filter table based on input values
    submit.addEventListener('click',function(){
        filterTable();
    })

    function filterTable() {
        const filterValue = filterInput.value.toLowerCase();
        const filterAmountValue = filterAmountInput.value.toLowerCase();

        const filteredTransactions = transactions.filter(transaction => {
            const customerName = customers.find(customer => customer.id === transaction.customer_id).name.toLowerCase();
            const amount = transaction.amount.toString().toLowerCase();

            const nameMatch = customerName.includes(filterValue);
            const amountMatch = amount.includes(filterAmountValue);

            return nameMatch && amountMatch;
        });

        displayTable(customers, filteredTransactions);
    }

    function displayTable(customers, transactions) {
        dataBody.innerHTML = '';
        transactions.forEach(transaction => {
            const customerName = customers.find(customer => customer.id === transaction.customer_id).name;
            const row = 
        `<tr class="hover:bg-gray-700">
        <td class="px-6 py-4 whitespace-nowrap">${customerName}</td>
        <td class="px-6 py-4 whitespace-nowrap">${transaction.date}</td>
        <td class="px-6 py-4 whitespace-nowrap">${transaction.amount}</td>
        </tr>`;
            dataBody.innerHTML += row;
        });
    }

    function updateChart(customerId) {
        if (chart) {
            chart.destroy();
        }

        const customerTransactions = transactions.filter(transaction => transaction.customer_id === customerId);
        const dates = [...new Set(customerTransactions.map(transaction => transaction.date))];
        const totalAmounts = dates.map(date => {
            return customerTransactions.filter(transaction => transaction.date === date)
                                    .reduce((acc, curr) => acc + curr.amount, 0);
        });
// -------------------- Chart With Bar ------------------------- 
        chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: dates,
                datasets: [{
                    label: 'Total Amount',
                    data: totalAmounts,
                    backgroundColor: '#ffbf00',
                    borderColor: '#ffbf00',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value;
                            }
                        }
                    }
                }
            }
        });
    }
    
// -------------------- Chart With Line ------------------------- 
//     chart = new Chart(ctx, {
//         type: 'line', 
//         data: {
//             labels: dates,
//             datasets: [{
//                 label: 'Total Amount',
//                 data: totalAmounts,
//                 fill: false, 
//                 borderColor: '#3182ce',
//                 borderWidth: 2
//             }]
//         },
//         options: {
//             scales: {
//                 y: {
//                     beginAtZero: true,
//                     ticks: {
//                         callback: function(value) {
//                             return '$' + value;
//                         }
//                     }
//                 }
//             }
//         }
//     });
// }










    // Initial chart display
    updateChart(1); // Display chart for the first customer by default

    // Event listener for table row click (to update chart)
    dataTable.addEventListener('click', function(event) {
        if (event.target.tagName === 'TD') {
            const rowIndex = event.target.parentNode.rowIndex - 1; // Subtract header row
            const customerId = transactions[rowIndex].customer_id;
            updateChart(customerId);
        }
    });
});
