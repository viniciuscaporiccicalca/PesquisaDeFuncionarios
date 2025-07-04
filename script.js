// Configurações da Planilha
const sheetId = '1q3_n6I9MqLtn55dUBfb1F4VIdh3FCd1F5dK1c1K0Bjc';
const sheetName = encodeURIComponent('Página1');
const sheetURL = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${sheetName}`;

// Configurações da Tabela e Filtros
const columnsToShow = ['Nome(Funcionários)', 'Setor', 'UND', 'Data Nasc.', 'Data ADM.', 'Mês Nasc.', 'Mês ADM.', 'Idade', 'Tempo de Unimake'];
const columnHeaders = {
    'Nome(Funcionários)': 'Nome', 'Setor': 'Setor', 'UND': 'UND (Unidade)', 'Data Nasc.': 'Data Nasc.',
    'Data ADM.': 'Data ADM.', 'Mês Nasc.': 'Mês Nasc.', 'Mês ADM.': 'Mês ADM.', 'Idade': 'Idade', 'Tempo de Unimake': 'Tempo de Unimake'
};
const fixedSectors = ['ADM', 'CRM', 'DEV', 'ISM', 'MKT', 'STI', 'WEB'];
const fixedUnits = ['CM', 'PV'];

// Variável para armazenar os dados
let tableData = [];

// Função para exibir mensagens de status na tela
const statusDiv = document.getElementById('status');
function showStatus(message) {
    statusDiv.innerHTML = message;
    console.log(message); // Também exibe no console para depuração
}

// Função principal que busca e sincroniza os dados
function fetchAndSyncData() {
    showStatus("Sincronizando com a planilha...");
    fetch(sheetURL)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erro de rede: ${response.statusText}`);
            }
            return response.text();
        })
        .then(csvText => {
            if (!csvText || csvText.trim().length === 0) {
                throw new Error("O arquivo CSV recebido está vazio.");
            }
            tableData = parseCSV(csvText);
            if (tableData.length > 0) {
                showStatus(`Dados carregados: ${tableData.length} registros encontrados.`);
                filterTable();
            } else {
                showStatus("Nenhum dado encontrado na planilha. Verifique se ela não está vazia.");
            }
        })
        .catch(error => {
            showStatus(`<strong>Erro ao carregar dados:</strong> ${error.message}. Verifique o link da planilha e a conexão.`);
            console.error(error);
        });
}

/**
 * Analisador de CSV mais robusto.
 * Lida com o formato `"campo1","campo2",...` do Google Sheets.
 */
function parseCSV(text) {
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) return []; // Retorna vazio se não houver cabeçalho e pelo menos uma linha de dados

    // Extrai os cabeçalhos da primeira linha
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    console.log("Cabeçalhos detectados:", headers);

    const data = [];
    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === '') continue;
        const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        
        // Só adiciona a linha se o número de colunas corresponder ao de cabeçalhos
        if (values.length === headers.length) {
            const rowObject = {};
            for (let j = 0; j < headers.length; j++) {
                rowObject[headers[j]] = values[j];
            }
            data.push(rowObject);
        }
    }
    console.log("Dados processados:", data);
    return data;
}

// Preenche a tabela no HTML com os dados filtrados
function populateTable(data) {
    const tableHead = document.querySelector('#dataTable thead');
    const tableBody = document.querySelector('#dataTable tbody');
    tableHead.innerHTML = '';
    tableBody.innerHTML = '';

    const headerRow = document.createElement('tr');
    columnsToShow.forEach(key => {
        const th = document.createElement('th');
        th.textContent = columnHeaders[key] || key;
        headerRow.appendChild(th);
    });
    tableHead.appendChild(headerRow);

    if (data.length === 0) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = columnsToShow.length;
        cell.textContent = "Nenhum resultado encontrado para os filtros aplicados.";
        cell.style.textAlign = "center";
        row.appendChild(cell);
        tableBody.appendChild(row);
    } else {
        data.forEach(rowData => {
            const row = document.createElement('tr');
            columnsToShow.forEach(key => {
                const td = document.createElement('td');
                td.textContent = rowData[key] || '';
                row.appendChild(td);
            });
            tableBody.appendChild(row);
        });
    }
}

// Filtra os dados com base nos inputs do usuário
function filterTable() {
    const nameFilter = document.getElementById('nameInput').value.toLowerCase();
    const sectorFilter = document.getElementById('sectorSelect').value;
    const unitFilter = document.getElementById('unitSelect').value;

    const filteredData = tableData.filter(row => {
        // Verifica se a propriedade existe no objeto 'row' antes de aplicar o filtro
        const nameMatch = row['Nome(Funcionários)'] ? row['Nome(Funcionários)'].toLowerCase().includes(nameFilter) : true;
        const sectorMatch = sectorFilter ? row['Setor'] === sectorFilter : true;
        const unitMatch = unitFilter ? row['UND'] === unitFilter : true;
        return nameMatch && sectorMatch && unitMatch;
    });
    populateTable(filteredData);
}

// Preenche os filtros de Setor e Unidade com as opções fixas
function populateFixedFilterOptions() {
    const sectorSelect = document.getElementById('sectorSelect');
    const unitSelect = document.getElementById('unitSelect');
    fixedSectors.forEach(sector => sectorSelect.add(new Option(sector, sector)));
    fixedUnits.forEach(unit => unitSelect.add(new Option(unit, unit)));
}

// Limpa todos os filtros e reexibe a tabela completa
function clearFilters() {
    document.getElementById('nameInput').value = '';
    document.getElementById('sectorSelect').value = '';
    document.getElementById('unitSelect').value = '';
    filterTable();
}

// Ponto de entrada: executado quando a página termina de carregar
document.addEventListener('DOMContentLoaded', () => {
    populateFixedFilterOptions();
    fetchAndSyncData();
    
    document.getElementById('nameInput').addEventListener('keyup', filterTable);
    document.getElementById('sectorSelect').addEventListener('change', filterTable);
    document.getElementById('unitSelect').addEventListener('change', filterTable);
    document.getElementById('clearFiltersBtn').addEventListener('click', clearFilters);
    
    setInterval(fetchAndSyncData, 300000); // Sincroniza a cada 5 minutos
});