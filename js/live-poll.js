
const voteCtx = document.getElementById('voteChart').getContext('2d');
const pieCtx = document.getElementById('pieChart').getContext('2d');
const doughnutCtx = document.getElementById('doughnutChart').getContext('2d');
const lineCtx = document.getElementById('lineChart').getContext('2d');


const colors = [
    'rgba(75, 192, 192, 0.8)',
    'rgba(54, 162, 235, 0.8)',
    'rgba(255, 206, 86, 0.8)',
    'rgba(153, 102, 255, 0.8)',
    'rgba(255, 99, 132, 0.8)',
    'rgba(255, 159, 64, 0.8)'
];

// Krijimi i formave te charteve
const voteChart = new Chart(voteCtx, {
    type: 'bar',
    data: {
        labels: [],
        datasets: [{
            label: 'Votes',
            data: [],
            backgroundColor: colors,
            borderColor: colors.map(color => color.replace('0.8', '1')),
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        scales: { y: { beginAtZero: true } },
        plugins: { legend: { display: true } }
    }
});


const pieChart = new Chart(pieCtx, {
    type: 'pie',
    data: {
        labels: [],
        datasets: [{
            data: [],
            backgroundColor: colors,
            borderColor: '#fff',
            borderWidth: 2
        }]
    },
    options: {
        responsive: true,
        plugins: { legend: { position: 'top' } }
    }
});


const doughnutChart = new Chart(doughnutCtx, {
    type: 'doughnut',
    data: {
        labels: [],
        datasets: [{
            data: [],
            backgroundColor: colors,
            borderColor: '#fff',
            borderWidth: 2
        }]
    },
    options: {
        responsive: true,
        plugins: { legend: { position: 'bottom' } }
    }
});


const lineChart = new Chart(lineCtx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Vote Trends',
            data: [],
            borderColor: 'rgba(75, 192, 192, 0.8)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderWidth: 2,
            tension: 0.3
        }]
    },
    options: {
        responsive: true,
        plugins: { legend: { display: true } },
        scales: { y: { beginAtZero: true } }
    }
});

const eventSource = new EventSource('/live-results');
// Caktimi i perditsimit te secili chart ne baze te kandiadeteve dhe ndarjen e tyre
eventSource.onmessage = function (event) {
    const candidates = JSON.parse(event.data);

    const candidateNames = candidates.map(candidate => candidate.name);
    const voteCounts = candidates.map(candidate => candidate.votes);

   
    [voteChart, pieChart, doughnutChart, lineChart].forEach(chart => {
        chart.data.labels = candidateNames;
        chart.data.datasets[0].data = voteCounts;
        chart.update();
    });
};

eventSource.onerror = function () {
    console.error("Error connecting to the live poll results.");
    eventSource.close();
};
