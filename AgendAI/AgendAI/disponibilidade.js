document.querySelectorAll('.day-setting input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', (event) => {
        const parent = event.target.closest('.day-setting');
        const timeInputs = parent.querySelectorAll('.time-input');

        timeInputs.forEach(input => {
            if (event.target.checked) {
                input.removeAttribute('disabled');
            } else {
                input.setAttribute('disabled', 'disabled');
            }
        });
    });
});

const saveBtn = document.getElementById('save-btn');
saveBtn.addEventListener('click', () => {
    const availability = {};
    document.querySelectorAll('.day-setting').forEach(setting => {
        const checkbox = setting.querySelector('input[type="checkbox"]');
        if (checkbox.checked) {
            const day = checkbox.id;
            const start = setting.querySelector(`#${day}-start`).value;
            const end = setting.querySelector(`#${day}-end`).value;
            availability[day] = { start, end };
        }
    });

    localStorage.setItem('agendai_disponibilidade', JSON.stringify(availability));
    alert('Disponibilidade salva com sucesso! Você pode alterá-la a qualquer momento.');
});


window.addEventListener('load', () => {
    const savedData = JSON.parse(localStorage.getItem('agendai_disponibilidade'));
    
    if (savedData) {
        for (const day in savedData) {
            const checkbox = document.getElementById(day);
            if (checkbox) {
                checkbox.checked = true;
                const parent = checkbox.closest('.day-setting');
                const timeInputs = parent.querySelectorAll('.time-input');
                
                timeInputs[0].value = savedData[day].start;
                timeInputs[1].value = savedData[day].end;
                timeInputs.forEach(input => input.removeAttribute('disabled'));
            }
        }
    }
});

// --- Lógica do Calendário de Agendamentos ---

// Mock data for entrepreneur appointments (replace with actual data fetching if available)
// Format: 'YYYY-MM-DD'
const mockEntrepreneurAppointments = [
    '2026-04-10', // Exemplo de agendamento
    '2026-04-11', // Exemplo de agendamento
    '2026-04-15',
    '2026-04-22',
    '2026-05-05',
    '2026-05-18'
];

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

const monthYearDisplay = document.getElementById('currentMonthYear');
const calendarGrid = document.getElementById('calendarGrid');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');

function renderCalendar() {
    // Clear previous days but keep day names
    const existingDayNames = calendarGrid.querySelectorAll('.day-name');
    calendarGrid.innerHTML = ''; // Clear all
    existingDayNames.forEach(dayName => calendarGrid.appendChild(dayName)); // Re-add day names

    // Add day names if they were cleared (initial load)
    if (calendarGrid.children.length === 0) {
        const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        dayNames.forEach(name => {
            const dayNameDiv = document.createElement('div');
            dayNameDiv.classList.add('day-name');
            dayNameDiv.textContent = name;
            calendarGrid.appendChild(dayNameDiv);
        });
    }

    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfWeek = firstDayOfMonth.getDay(); // 0 for Sunday, 1 for Monday, etc.

    monthYearDisplay.textContent = new Date(currentYear, currentMonth).toLocaleString('pt-BR', { month: 'long', year: 'numeric' });

    // Add empty days for the start of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.classList.add('calendar-day', 'empty');
        calendarGrid.appendChild(emptyDay);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dayDiv = document.createElement('div');
        dayDiv.classList.add('calendar-day');
        dayDiv.textContent = day;

        const fullDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        // Check if this day has an appointment
        if (mockEntrepreneurAppointments.includes(fullDate)) {
            dayDiv.classList.add('has-appointment');
        }

        // Mark current day
        const today = new Date();
        if (day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()) {
            dayDiv.classList.add('current-day');
        }

        calendarGrid.appendChild(dayDiv);
    }
}

prevMonthBtn.addEventListener('click', () => { currentMonth--; if (currentMonth < 0) { currentMonth = 11; currentYear--; } renderCalendar(); });
nextMonthBtn.addEventListener('click', () => { currentMonth++; if (currentMonth > 11) { currentMonth = 0; currentYear++; } renderCalendar(); });

// Initial render of the calendar when the page loads
window.addEventListener('load', () => {
    // Existing availability loading logic
    const savedData = JSON.parse(localStorage.getItem('agendai_disponibilidade'));
    if (savedData) {
        for (const day in savedData) {
            const checkbox = document.getElementById(day);
            if (checkbox) {
                checkbox.checked = true;
                const parent = checkbox.closest('.day-setting');
                const timeInputs = parent.querySelectorAll('.time-input');
                timeInputs[0].value = savedData[day].start;
                timeInputs[1].value = savedData[day].end;
                timeInputs.forEach(input => input.removeAttribute('disabled'));
            }
        }
    }
    renderCalendar(); // Render calendar after availability
});