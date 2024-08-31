// Global variables
let currentValue = 0;
let rowCount = 1;
let currentDate; // Define global variable
let previousTotalDistance = 0; // Variable to keep track of the previous total distance

window.addEventListener('load', function() {
    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach((el, index) => {
        setTimeout(() => {
            el.classList.add('visible');
        }, index * 200); // Stagger the animations with a delay
    });

    // Initialize currentDate
    currentDate = getFirstDayOfCurrentMonth();

    // Trigger addRow on Enter key press
    document.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent default action of Enter key (e.g., form submission)
            addRow();
        }
    });

    // Prevent right-click context menu
    document.addEventListener('contextmenu', function(event) {
        event.preventDefault();
    });

   
});

function getFirstDayOfCurrentMonth() {
    let now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
}

function formatter(date) {
    let day = String(date.getDate()).padStart(2, '0');
    let month = String(date.getMonth() + 1).padStart(2, '0');
    let year = date.getFullYear();

    return `${day}-${month}-${year}`;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function addRow() {
    let odometer = parseInt(document.getElementById("odometer").value) || 0;
    let travelDistance = parseInt(document.getElementById("travelDistance").value) || 0;
    let homeDistance = parseInt(document.getElementById("homeDistance").value) || 0;

    if (travelDistance === 0) {
        alert("Check Travel distance");
        return;
    }
    if (homeDistance === 0) {
        alert("Check Home Distance");
        return;
    }

    let randomHomeDistance = getRandomInt(1, homeDistance);
    let formattedDate = formatter(currentDate);

    let table = document.getElementById("dynamicTable").getElementsByTagName('tbody')[0];
    let row = table.insertRow();

    let cell1 = row.insertCell(0);
    let cell2 = row.insertCell(1);
    let cell3 = row.insertCell(2);
    let cell4 = row.insertCell(3);
    let cell5 = row.insertCell(4);

    cell1.innerHTML = formattedDate;
    cell2.innerHTML = travelDistance;

    let initialReading;
    if (rowCount === 1) {
        initialReading = odometer;
        previousTotalDistance = initialReading;
    } else {
        initialReading = previousTotalDistance;
    }

    cell3.innerHTML = initialReading;

    let totalDistance = travelDistance + previousTotalDistance;
    cell4.innerHTML = totalDistance;

    cell5.innerHTML = randomHomeDistance;

    currentValue += travelDistance + randomHomeDistance;
    previousTotalDistance = totalDistance + randomHomeDistance;
    currentDate.setDate(currentDate.getDate() + 1);
    document.getElementById("odometer").disabled = true;
    document.getElementById("travelDistance").value = "";
    rowCount++;
}

function removeLastRow() {
    let table = document.getElementById("dynamicTable").getElementsByTagName('tbody')[0];
    let rowCount = table.rows.length;

    if (rowCount > 0) {
        table.deleteRow(rowCount - 1);
        rowCount--;
    } else {
        alert("No rows to remove.");
    }
}

function finishTable() {
    alert("Table generation finished!");
    document.getElementById("travelDistance").disabled = true;
    document.querySelector("button[onclick='addRow()']").disabled = true;
    document.querySelector("button[onclick='removeLastRow()']").disabled = true;
    document.getElementById("odometer").disabled = true;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
    });

    const marginLeft = 10;
    const marginTop = 20;
    const rowHeight = 10;
    const pageHeight = doc.internal.pageSize.height;

    let table = document.getElementById("dynamicTable");
    let rows = table.querySelectorAll("tbody tr");

    let colWidths = [40, 60, 60, 60, 60];

    let y = marginTop;
    let initialOdometer = parseInt(document.getElementById("odometer").value) || 0;

    // Function to add headers
    function addHeaders() {
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(`1. Home Distance = (present row Initial Reading - upper row Total Distance)`, marginLeft, y);

        y += rowHeight;

        doc.text("Date", marginLeft, y);
        doc.text("Travel Distance", marginLeft + colWidths[0], y);
        doc.text("Initial Reading", marginLeft + colWidths[0] + colWidths[1], y);
        doc.text("Final Reading", marginLeft + colWidths[0] + colWidths[1] + colWidths[2], y);
        doc.text("Home Distance", marginLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], y);

        y += rowHeight;
    }

    addHeaders(); // Add headers for the first page

    rows.forEach(row => {
        let cells = row.querySelectorAll("td");
        let text = [
            cells[0].innerText,
            cells[1].innerText,
            cells[2].innerText,
            cells[3].innerText,
            cells[4].innerText
        ];

        // Check if we need a new page
        if (y + rowHeight > pageHeight) {
            doc.addPage();
            y = marginTop;
            addHeaders(); // Add headers for the new page
        }

        text.forEach((item, index) => {
            doc.text(item.toString(), marginLeft + index * colWidths[index], y);
        });

        y += rowHeight;
    });

    let fileName = "Pathra " + new Date().toISOString().split('T')[0] + ".pdf";
    doc.save(fileName);
}
