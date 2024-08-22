let username = 'coalition',
    password = 'skills-test',
    auth = btoa(`${username}:${password}`),
    
    
    activePatientAvatar = document.querySelector('.activePatient .activePatientAvatar'),
    nameElement = document.querySelector('.activePatient .activePatientName'),
    birthdayElement = document.querySelector('.activePatient .birthday'),
    genderElement = document.querySelector('.activePatient .gender'),
    contactElement = document.querySelector('.activePatient .contact'),
    emergencyContactElement = document.querySelector('.activePatient .emergencyContact'),
    insuranceElement = document.querySelector('.activePatient .insurance'),
    
    
    respiratoryRateElement = document.querySelector('.respiratoryRate  .diagnosisData'),
    temperatureRateElement = document.querySelector('.temperature  .diagnosisData'),
    heartRateElement = document.querySelector('.heartRate  .diagnosisData'),
    
    respiratoryRateStateElement = document.querySelector('.respiratoryRate  .diagnosisState span'),
    temperatureRateStateElement = document.querySelector('.temperature  .diagnosisState span'),
    heartRateRateStateElement = document.querySelector('.heartRate  .diagnosisState span'),
    
    systolicDataElement = document.querySelector('.systolic  .chartContextData'),
    diastolicDataElement = document.querySelector('.diastolic  .chartContextData'),
    
    
    bloodPressureChart = document.querySelector('#bloodPressureChart');

function fetchData() {
 fetch('https://fedskillstest.coalitiontechnologies.workers.dev', {
        headers: {
            'Authorization': `Basic ${auth}`
        }
    }).then(function(response) {
        if (response.ok) {
            return response.json();
        }
        throw response;
    }).then(function(data) {
        apiData = data;
        console.log("API Data loaded");
        const activePatientName = getActivePatientName();
        if (activePatientName) {
            getActivePatientData(activePatientName);
        }
    }).catch(function(error) {
        console.warn(error);
    });
}

function populateDiagnosticList(diagnosticList) {

    var tbody = document.querySelector('.diagnosticList table tbody');

    // Delete everything already in there
    tbody.innerHTML = '';

    diagnosticList.forEach(function(diagnostic) {
        const diagnosticListItem = `
        <!-- Diagnostic Item Start -->
            <tr>
                <td class="leftColumn">${diagnostic.name || 'N/A'}</td>
                <td class="centerColumn">${diagnostic.description || 'N/A'}</td>
                <td class="rightColumn">${diagnostic.status || 'N/A'}</td>
            </tr>
        `;

        tbody.insertAdjacentHTML('beforeend', diagnosticListItem);
    });
}

function populateLabResultsList(labResults) {
    var labResultsContainer = document.querySelector('.labResults  .labResultsContainer');
    
    // Delete everything already in there
    labResultsContainer.innerHTML = '';
    labResults.forEach(function(result) {

        const labResultItem = `
        <!-- Lab Result Item Start -->
            <div class="result">
                <div class="resultTitle">${result || 'N/A'}</div>
                <a href="#" class="icon download"><img src="img/download_FILL0_wght300_GRAD0_opsz24.svg" alt=""></a>
            </div>
        `;
        labResultsContainer.insertAdjacentHTML('beforeend', labResultItem);
    });
}


function buildChart(activePatientDiagnosticHistory) {
    
 const maxMonths = 6;
   
    const sortedData = activePatientDiagnosticHistory.sort((a, b) => {
        const dateA = new Date(`${a.month} ${a.year}`);
        const dateB = new Date(`${b.month} ${b.year}`);
        return dateA - dateB;
    });

    const limitedData = sortedData.slice(-maxMonths); 
    const labels = limitedData.map(entry => {
        const month = entry.month.substring(0, 3); 
        return `${month}, ${entry.year}`;
    });

    const systolicData = activePatientDiagnosticHistory.map(entry => entry.blood_pressure.systolic);
    const diastolicData = activePatientDiagnosticHistory.map(entry => entry.blood_pressure.diastolic);

    const chartCanvas = document.querySelector('#bloodPressureChart').getContext('2d');


    bloodPressureChart = new Chart(chartCanvas, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    display: false,
                    label: 'Systolic Blood Pressure',
                    data: systolicData,
                    borderColor: 'rgb(230,111,210)',
                    backgroundColor: 'rgb(230,111,210)',
                    fill: false,
                    tension: 0.5,
                    pointStyle: 'circle',
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    borderWidth: 2,
                    pointBorderWidth: 1,
                    pointBorderColor: 'rgba(255, 255, 255, 1)'
                },
                {
                    label: 'Diastolic Blood Pressure',
                    data: diastolicData,
                    borderColor: 'rgba(140, 111, 230, 1)',
                    backgroundColor: 'rgba(140, 111, 230, 1)',
                    fill: false,
                    tension: 0.5,
                    pointStyle: 'circle',
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    borderWidth: 2,
                    pointBorderWidth: 1,
                    pointBorderColor: 'rgba(255, 255, 255, 1)'
                }
            ]
        },
        options: {
            responsive: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: false,
                        text: 'Measurements'
                    }
                },
                x: {
                    title: {
                        display: false,
                        text: 'Date'
                    },
                    grid: {
                      display: false
                    }

                }
            }
        }
    });
}


function fixDateFormating (dateString) {
    const date = new Date(dateString);
    const formattedDate = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(date);
    return formattedDate;
}

function getActivePatientData(activePatientName) {
    
    var filteredPatient = apiData.filter(function(patient) {
        return patient.name === activePatientName;
    });

    if (filteredPatient.length > 0) {

        populateDiagnosticList(filteredPatient[0].diagnostic_list);
        populateLabResultsList(filteredPatient[0].lab_results);


        activePatientAvatar.src = filteredPatient[0].profile_picture || 'N/A';
        nameElement.textContent = filteredPatient[0].name || 'N/A';

        
        // The date formatting was wrong, so I had to change it into the format shown in the mock up. 
        
        const dateOfBirth = filteredPatient[0].date_of_birth || 'N/A';
        birthdayElement.textContent = dateOfBirth === 'N/A' ? 'N/A' : fixDateFormating(dateOfBirth);
        
        
        genderElement.textContent = filteredPatient[0].gender || 'N/A';
        contactElement.textContent = filteredPatient[0].phone_number || 'N/A';
        emergencyContactElement.textContent = filteredPatient[0].emergency_contact || 'N/A';
        insuranceElement.textContent = filteredPatient[0].insurance_type || 'N/A';
    
        respiratoryRateElement.textContent = filteredPatient[0].diagnosis_history[0].respiratory_rate.value || 'N/A';
        respiratoryRateStateElement.textContent = filteredPatient[0].diagnosis_history[0].respiratory_rate.levels || 'N/A';
        
        temperatureRateElement.textContent = filteredPatient[0].diagnosis_history[0].temperature.value || 'N/A';
        temperatureRateStateElement.textContent = filteredPatient[0].diagnosis_history[0].temperature.levels || 'N/A';
        
        
        heartRateElement.textContent = filteredPatient[0].diagnosis_history[0].heart_rate.value || 'N/A';
        heartRateRateStateElement.textContent = filteredPatient[0].diagnosis_history[0].heart_rate.levels || 'N/A';
        
        systolicDataElement.textContent = filteredPatient[0].diagnosis_history[0].blood_pressure.systolic.value || 'N/A';
        diastolicDataElement.textContent = filteredPatient[0].diagnosis_history[0].blood_pressure.diastolic.value || 'N/A';
        
        const activePatientDiagnosticHistory = filteredPatient[0].diagnosis_history.map(entry => ({
            month: entry.month,
            year: entry.year,
            blood_pressure: {
                systolic: entry.blood_pressure.systolic.value,
                diastolic: entry.blood_pressure.diastolic.value
            }
        }));


        // Chart
        buildChart(activePatientDiagnosticHistory);
        
        
        
        
    } else {
        console.log("No patient found");
    }

}

function getActivePatientName() {
    var activePatientName = document.querySelector('.active .patientName').textContent.trim();
    return activePatientName;
}

var patientElements = document.querySelectorAll('.patientsList .patient');

patientElements.forEach(function(patientElement) {
    patientElement.addEventListener('click', function() {
        patientElements.forEach(function(el) {
            el.classList.remove('active');
        });

        patientElement.classList.add('active');

            bloodPressureChart.destroy();
 
        
        const activePatientName = getActivePatientName();
        getActivePatientData(activePatientName);
    });
});

fetchData();