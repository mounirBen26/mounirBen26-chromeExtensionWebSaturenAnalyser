//getting popup dom elements
const analyser = document.querySelector('#analyser')
const h3Export = document.querySelector('#exportTitle')
const titreAbonne = document.querySelector('#abonneTitle')
const lastClientSeen = document.querySelector('#lastClientSeen')
h3Export.style.display = 'none';


//getting back data from the ative page:
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    let donnees = request.listObj
    let title = request.titleAbn
    titreAbonne.innerHTML = title
    titreAbonne.style.fontWeight = '600'

    //***** Last seen test
    // const titleAbn = titreAbonne.innerHTML; 
    // console.log('*---------',titleAbn)
    // lastClientSeen.innerHTML =titleAbn ;
    SetlastSeenClient(title)
    //****** */
    const datesArray = []
    const phase1Array = []
    const phase2Array = []
    const phase3Array = []
    const exportArray = []

    //creating datasets for charts

    Object.entries(donnees).forEach(item => {
        datesArray.push(item[0])
        phase1Array.push(item[1]['phase1'])
        phase2Array.push(item[1]['phase2'])
        phase3Array.push(item[1]['phase3'])
        exportArray.push(item[1]['totExport'])
    })
    
    // getting the differnce between n and n-1 indexs
    const resultPhase1 = phase1Array.slice(1).map((current, index) => phase1Array[index] - current)
    const resultPhase2 = phase2Array.slice(1).map((current, index) => phase2Array[index] - current)
    const resultPhase3 = phase3Array.slice(1).map((current, index) => phase3Array[index] - current)
    const granTabl = resultPhase1 + resultPhase2+resultPhase3



    // Configuration for the line chart
    var barChartCtx = document.getElementById('lineChart').getContext('2d');
    var barChart = new Chart(barChartCtx, {
        type: 'bar',
        data: {
            labels: datesArray,
            datasets: [{
                label: 'Energie Phase 1',
                data: phase1Array,
                backgroundColor: '#25be2b',
                borderColor: '#25be2b',
                borderWidth: 1
            },
            {
                label: 'Energie Phase 2',
                data: phase2Array,
                backgroundColor: 'red',
                borderColor: 'red',
                borderWidth: 1
            },
            {
                label: 'Energie Phase 3',
                data: phase3Array,
                backgroundColor: 'rgb(0, 157, 255)',
                borderColor: 'rgb(0, 157, 255)',
                borderWidth: 1
            }
            ]
        },
        options: {
            title: {
                display: true,
                text: 'Equilibre des Phases'
            },
            scales: {
                xAxes: [{
                    stacked: true
                }],
                yAxes: [{
                    stacked: true,
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });
    // drawing Export Chart
    h3Export.style.display = 'block';
    var exportChartCtx = document.getElementById('exportChart').getContext('2d');
    var exportChart = new Chart(exportChartCtx, {
        type: 'line',
        data: {
            labels: datesArray,
            datasets: [{
                label: 'Total Export',
                data: exportArray,
                backgroundColor: 'purple',
                borderColor: 'purple',
                borderWidth: 2,
                fill: false
            }]
        },
        options: {
            title: {
                display: true,
                text: 'Evolution Energie Export'
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        stepSize: 1000
                    }
                }]
            }
        }
    });


    //drawing Consume active difference
    var consomChartCtx = document.getElementById('consomDiff').getContext('2d');
    var exportChart = new Chart(consomChartCtx, {
        type: 'bar',
        data: {
            labels: datesArray,
            datasets: [{
                label: 'Consommation Phase 1',
                data: resultPhase1,
                backgroundColor: '#25be2b',
                borderColor: '#25be2b',
                borderWidth: 2,
                fill: false
            },
            {
                label: 'Consommation Phase 2',
                data: resultPhase2,
                backgroundColor: 'red',
                borderColor: 'red',
                borderWidth: 2,
                fill: false
            }, {
                label: 'Consommation Phase 3',
                data: resultPhase3,
                backgroundColor: 'rgb(0, 157, 255)',
                borderColor: 'rgb(0, 157, 255)',
                borderWidth: 2,
                fill: false
            }]
        },
        options: {
            title: {
                display: true,
                text: 'Consommation Mensuelle Par Phase'
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        stepSize: 1000
                    }
                }]
            }
        }
    });

    // add table section

    //Create a table
    const tableSection = document.querySelector('#table')

    const table = document.createElement("table");

    // Create header row
    const headerRow = table.insertRow(0);
    const dateHeader = headerRow.insertCell(0);
    const tarif1Header = headerRow.insertCell(1);
    const tarif2Header = headerRow.insertCell(2);
    const tarif3Header = headerRow.insertCell(3);

    dateHeader.innerHTML = "Date";
    tarif1Header.innerHTML = "Phase 1";
    tarif2Header.innerHTML = "Phase 2";
    tarif3Header.innerHTML = "Phase 3";

    // Populate the table with data

        for (var i=0; i< Math.max(datesArray.length,resultPhase1.length, resultPhase2.length, resultPhase3.length) - 1;i++){
        const row = table.insertRow(-1);
        const dateCell = row.insertCell(0);
        const tarif1Cell = row.insertCell(1);
        const tarif2Cell = row.insertCell(2);
        const tarif3Cell = row.insertCell(3);

        dateCell.innerHTML = datesArray[i];
        tarif1Cell.innerHTML = resultPhase1[i];
        if(resultPhase1[i] == 0){
            tarif1Cell.style.backgroundColor = 'rgb(177, 70, 100)'
            tarif1Cell.style.color = 'white'
        }
        tarif2Cell.innerHTML = resultPhase2[i];
        if(resultPhase2[i] == 0){
            tarif2Cell.style.backgroundColor = 'rgb(177, 70, 100)'
            tarif2Cell.style.color = 'white'
        }
        tarif3Cell.innerHTML = resultPhase3[i];
        if(resultPhase3[i] == 0){
            tarif3Cell.style.backgroundColor = 'rgb(177, 70, 100)'
            tarif3Cell.style.color = 'white'
        }
 
        }
    //Append the table to the body
    tableSection.appendChild(table);

})

// getting tabs infos
analyser.addEventListener('click', async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: getData
    })
    analyser.style.display = 'none'
    
})


function getData() {
    const titleAbn = document.getElementById('LabelRef').textContent

    let listObj = {}
    // getting the active enrgie - import register
    const tdElems = document.querySelectorAll('[id*="myUC_RadGridResultat_ctl00__"]')
    tdElems.forEach(element => {
        
        date = Object.entries(element.textContent.split(':'))['0'][1].trim()
        if(date.startsWith('01/')){
             console.log('=====',date)
         }else console.log('-----',date)

        if(date.startsWith('01') ){

        date = date.split(' ')[0]
        try {
            const phase1 = Object.entries(element.textContent.split(':'))['7'][1].match(/(\d+)Phase/)[1]
            const phase2 = Object.entries(element.textContent.split(':'))['8'][1].match(/(\d+)Phase/)[1]
            const phase3 = Object.entries(element.textContent.split(':'))['9'][1].match(/(\d+)Total/)[1]
            const totExport = Object.entries(element.textContent.split(':'))[10][1].match(/\d+/)[0]
            listObj[date] = { phase1, phase2, phase3, totExport }
        } catch (error) {
            console.log('error', error)
        }

        }

    })

    // getting the active enrgie - export register
    

    chrome.runtime.sendMessage({
        type: "sendListObj",
        listObj,
        type: "abnTitle",
        titleAbn
    })
}






//////////////////////////////// LOCAL STORAGE ////////////////////////////


function saveDataToArray(data) {
    
    var saveDataButton = document.getElementById('saveData');
    // Retrieve existing data array or create a new one if it doesn't exist
    chrome.storage.local.get(['dataArray'], function(result) {
        var dataArray = result.dataArray || [];
        if(dataArray.includes(data)){
            alert('le client est déja dans la liste!')
            saveDataButton.disabled = true
            saveDataButton.style.opacity= 0.5
        }
        //Else Push new data into the array
        if(!dataArray.includes(data) && data.length > 0){
            dataArray.push(data);
            saveDataButton.disabled = true
            saveDataButton.style.opacity= 0.5
        }
        
        // Save the updated array back to local storage
        chrome.storage.local.set({ 'dataArray': dataArray }, function() {
            console.log('Data saved successfully',dataArray);
        });
    });
}


function getDataArray(callback) {
    // var retrieveDataButton = document.getElementById('retrieveData');
    let listContainer = document.querySelector('#list-container');
    listContainer.style.display = 'flex'
    listContainer.style.flexDirection ="column"
    listContainer.style.alignItems = "center"
    // Retrieve data array from local storage
    chrome.storage.local.get(['dataArray'], function(result) {
        var dataArray = result.dataArray || [];
        dataArray.forEach(function(item,index){
            let del = document.createElement('button')
            del.type = "sumbit"
            del.innerHTML = "Supprimer"
            del.style.backgroundColor = "red"
            // del.style.padding = "1px 3px"
            del.style.border = 'none'
            del.style.color = 'white'
            del.style.fontWeight = 'bold'
            del.style.cursor ="pointer"
            del.style.borderRadius = '5px'
            del.style.marginRight = '5px'
            del.style.padding = '5px'
            del.style.width ="100px"
            let p = document.createElement('p')
            p.innerHTML =  item
            p.style.fontStyle = 'italic'
            p.style.fontSize="11px"
            listContainer.appendChild(p)
            listContainer.appendChild(del)
            del.addEventListener('click',function(){
                const indexOfItem = dataArray.indexOf(item)
                dataArray.splice(indexOfItem,1)
                chrome.storage.local.set({ 'dataArray': dataArray }, function() {
                    console.log('Data saved successfully',dataArray);
                });
                alert('Client supprimé de la Liste!')
                listContainer.removeChild(p)
                listContainer.removeChild(del)
            })
        })
        
        callback(dataArray);
        
    });
}

/// LAST CLIENT SEEN 
function SetlastSeenClient(data){
    chrome.storage.local.set({ 'lastSeen': data }, function() {
        console.log('Data saved successfully',dataArray);
    });
}
function GetLastSeenClient(callback){
    chrome.storage.local.get('lastSeen',function(result){
        console.log('FFFFFFFFFFFFF',result.lastSeen)
        lastClientSeen.innerHTML = result.lastSeen;
        lastClientSeen.style.backgroundColor = "rgb(68, 100, 200)"
        lastClientSeen.style.color = "white"
        lastClientSeen.style.padding =" 5px"
        lastClientSeen.style.fontWeight = "bold"
        lastClientSeen.style.borderRadius = "5px"
    })
}

// function clearStorage(){
//     chrome.storage.local.clear(()=> {
//         console.log('Data cleared successfully');
//     })}
    

// Event listeners for buttons 

document.addEventListener('DOMContentLoaded', function() {
    var saveDataButton = document.getElementById('saveData');
    // var retrieveDataButton = document.getElementById('retrieveData');
    //const clear = document.querySelector('#clear')
    const listContainer = document.querySelector('#list-container')
   
    GetLastSeenClient()
    getDataArray(function(dataArray) {
        if(dataArray.length == 0 ){
            listContainer.innerHTML = 'liste vide!'
        }
        console.log('Data array:', dataArray);
    });

    // Save data button click handler
    saveDataButton.addEventListener('click', function() {
        const newData = titreAbonne.innerHTML; 
        saveDataToArray(newData);
    });
    






    // Retrieve data button click handler
    // retrieveDataButton.addEventListener('click', function() {
    //     let listContainer = document.querySelector('#list-container')
    //     getDataArray(function(dataArray) {
    //         if(dataArray.length == 0 ){
    //             listContainer.innerHTML = 'liste vide!'
    //         }
    //         console.log('Data array:', dataArray);
    //     });
    // });

    // delete storage content reset click
    // clear.addEventListener('click',function(){
    //     let listContainer = document.querySelector('#list-container')
    //     clearStorage()
    //     alert('Liste Remise à zéro ok!')
    //     listContainer.innerHTML = ''
    //     clear.style.display = 'none'
    // })    
});

