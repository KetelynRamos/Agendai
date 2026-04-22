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
if (saveBtn) {
    saveBtn.addEventListener('click', () => {
        const availability = {};
        // Tenta encontrar cards de dias usando diferentes seletores possíveis
        const dayCards = document.querySelectorAll('.day-setting, .day-card');
        
        dayCards.forEach(card => {
            const checkbox = card.querySelector('input[type="checkbox"]');
            if (checkbox && checkbox.checked) {
                const day = checkbox.id;
                const startInput = card.querySelector(`#${day}-start, .time-input:first-of-type`);
                const endInput = card.querySelector(`#${day}-end, .time-input:last-of-type`);
                
                if (startInput && endInput) {
                    availability[day] = { 
                        start: startInput.value, 
                        end: endInput.value 
                    };
                }
            }
        });

        localStorage.setItem('agendai_disponibilidade', JSON.stringify(availability));
        
        // Integrar com os avisos visuais de cada página
        if (typeof showToast === 'function') {
            showToast('Disponibilidade salva com sucesso!', 'success');
        } else {
            alert('Disponibilidade salva com sucesso!');
        }
    });
}



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

// --- Funções de Verificação de Disponibilidade (Compartilhadas) ---

/**
 * Verifica se um horário está disponível para agendamento.
 * @param {string} dataStr - Data no formato 'YYYY-MM-DD'
 * @param {string} horaStr - Hora no formato 'HH:mm'
 * @param {string} proNome - Nome do profissional (para verificar conflitos)
 * @returns {object} { disponivel: boolean, mensagem: string }
 */
function verificarDisponibilidade(dataStr, horaStr, proNome) {
    const availability = JSON.parse(localStorage.getItem('agendai_disponibilidade')) || {};
    const date = new Date(dataStr + 'T00:00:00'); // Garante fuso horário local
    const dayNames = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
    const dayOfWeek = dayNames[date.getDay()];

    const configDia = availability[dayOfWeek];

    // 1. Verificar se o profissional atende nesse dia
    if (!configDia) {
        return { disponivel: false, mensagem: `O profissional não atende aos ${dayOfWeek}s.` };
    }

    // 2. Verificar se está dentro do horário de atendimento
    const start = configDia.start;
    const end = configDia.end;
    
    if (horaStr < start || horaStr > end) {
        return { disponivel: false, mensagem: `Horário fora do expediente (${start} às ${end}).` };
    }

    // 3. Verificar conflitos com outros agendamentos
    const agendamentos = JSON.parse(localStorage.getItem('meus_agendamentos_cliente')) || [];
    const conflito = agendamentos.find(a => 
        a.nome === proNome && 
        a.data === dataStr && 
        a.hora === horaStr && 
        a.status !== 'cancelled'
    );

    if (conflito) {
        return { disponivel: false, mensagem: "Este horário já está reservado para este profissional." };
    }

    return { disponivel: true, mensagem: "Horário disponível!" };
}

/**
 * Gera uma lista de horários livres para um profissional em uma data.
 * @param {string} proNome 
 * @param {string} dataStr 
 * @returns {Array} Lista de strings de horários ['08:00', '09:00'...]
 */
/**
 * Gera uma lista de horários livres para um profissional em uma data.
 * @param {string} proNome 
 * @param {string} dataStr 
 * @returns {Array} Lista de strings de horários ['08:00', '09:00'...]
 */
function obterSlotsDisponiveis(proNome, dataStr) {
    const availability = JSON.parse(localStorage.getItem('agendai_disponibilidade')) || {};
    const date = new Date(dataStr + 'T00:00:00');
    const dayNames = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
    const dayOfWeek = dayNames[date.getDay()];
    let configDia = availability[dayOfWeek];

    // Seeding de expediente específico para o protótipo (Diferenciação por profissional)
    // Se não houver configuração global, ou apenas para variar no protótipo:
    if (!configDia) {
        // Fallback padrão se não houver nada configurado, para não aparecer vazio no protótipo
        configDia = { start: '08:00', end: '18:00' };
    }

    // Variar o expediente dependendo do profissional para o protótipo
    let startHour = parseInt(configDia.start.split(':')[0]);
    let endHour = parseInt(configDia.end.split(':')[0]);

    if (proNome === 'Ana Oliveira') {
        startHour = Math.max(startHour, 13); // Ana só atende à tarde
    } else if (proNome === 'Carlos Silva') {
        endHour = Math.min(endHour, 14); // Carlos só atende de manhã/almoço
    } else if (proNome === 'Marcos Souza') {
        startHour = 6; endHour = 10; // Marcos é personal da madrugada/manhã cedo
    } else if (proNome === 'Fernanda Costa') {
        startHour = 10; endHour = 16; // Fernanda atende horário comercial reduzido
    } else if (proNome === 'Beatriz Lima') {
        startHour = 17; endHour = 21; // Beatriz atende à noite
    }


    const slots = [];
    const agendamentos = JSON.parse(localStorage.getItem('meus_agendamentos_cliente')) || [];

    for (let h = startHour; h < endHour; h++) {
        const horaFormatada = `${String(h).padStart(2, '0')}:00`;
        const ocupado = agendamentos.some(a => 
            a.nome === proNome && 
            a.data === dataStr && 
            a.hora === horaFormatada && 
            a.status !== 'cancelled'
        );

        if (!ocupado) {
            slots.push(horaFormatada);
        }
    }

    return slots;
}

/**
 * Cria dados fictícios para demonstração
 */
function inicializarDadosMock() {
    if (localStorage.getItem('agendai_mock_inicializado')) return;

    const hoje = new Date().toISOString().split('T')[0];
    const amanha = new Date(); amanha.setDate(amanha.getDate() + 1);
    const amanhaStr = amanha.toISOString().split('T')[0];

    const mockAgendamentos = [
        { id: 101, nome: 'Carlos Silva', especialidade: 'Barbeiro', data: hoje, hora: '09:00', status: 'completed' },
        { id: 102, nome: 'Carlos Silva', especialidade: 'Barbeiro', data: hoje, hora: '10:00', status: 'confirmed' },
        { id: 103, nome: 'Ana Oliveira', especialidade: 'Manicure', data: amanhaStr, hora: '14:00', status: 'confirmed' },
        { id: 104, nome: 'Marcos Souza', especialidade: 'Personal Trainer', data: hoje, hora: '16:00', status: 'completed' }
    ];

    const existing = JSON.parse(localStorage.getItem('meus_agendamentos_cliente')) || [];
    if (existing.length === 0) {
        localStorage.setItem('meus_agendamentos_cliente', JSON.stringify(mockAgendamentos));
    }

    // Garante uma disponibilidade básica se estiver vazio
    if (!localStorage.getItem('agendai_disponibilidade')) {
        const baseAvail = {
            segunda: {start:'08:00', end:'18:00'},
            terca: {start:'08:00', end:'18:00'},
            quarta: {start:'08:00', end:'18:00'},
            quinta: {start:'08:00', end:'18:00'},
            sexta: {start:'08:00', end:'18:00'},
            sabado: {start:'09:00', end:'13:00'}
        };
        localStorage.setItem('agendai_disponibilidade', JSON.stringify(baseAvail));
    }

    localStorage.setItem('agendai_mock_inicializado', 'true');
}

// Initial render of the calendar when the page loads
window.addEventListener('load', () => {
    inicializarDadosMock(); // Garante dados para o protótipo
    
    // Existing availability loading logic
    const savedData = JSON.parse(localStorage.getItem('agendai_disponibilidade'));
    if (savedData) {
        for (const day in savedData) {
            const checkbox = document.getElementById(day);
            if (checkbox) {
                checkbox.checked = true;
                const parent = checkbox.closest('.day-setting') || checkbox.closest('.day-card');
                if (parent) {
                    const timeInputs = parent.querySelectorAll('.time-input');
                    if (timeInputs.length >= 2) {
                        timeInputs[0].value = savedData[day].start;
                        timeInputs[1].value = savedData[day].end;
                        timeInputs.forEach(input => input.removeAttribute('disabled'));
                    }
                }
            }
        }
    }
    
    if (document.getElementById('calendarGrid')) {
        renderCalendar();
    }
});
