// !!! COLE AQUI O LINK DA SUA PLANILHA PUBLICADA COMO CSV !!!
const googleSheetURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRoBQPnk__29xiiH3zCqePoPLSE7aBDSiAJMoRz6BPG6IKpiDuUwrLWRALRRrw4WoyG3r8l5Xgd4Fjc/pub?output=csv';

// Elementos do DOM
const undFilter = document.getElementById('und-filter');
const setorFilter = document.getElementById('setor-filter');
const nomeFilter = document.getElementById('nome-filter');
const dataTable = document.getElementById('data-table');
const tableHead = dataTable.querySelector('thead');
const tableBody = dataTable.querySelector('tbody');

let originalData = []; // Array para armazenar todos os dados da planilha

/**
 * Função principal que é executada quando a página carrega
 */
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch(googleSheetURL);
        if (!response.ok) {
            throw new Error(`Erro ao buscar dados: ${response.statusText}`);
        }
        const csvText = await response.text();
        const parsedData = parseCSV(csvText);

        // Remove linhas em branco, se houver
        originalData = parsedData.filter(row => Object.values(row).some(cell => cell.trim() !== ''));

        if (originalData.length > 0) {
            renderTableHeader(Object.keys(originalData[0]));
            renderTableBody(originalData);
        } else {
            showTemporaryMessage('Nenhum dado encontrado na planilha.');
        }

    } catch (error) {
        console.error('Falha ao carregar dados da planilha:', error);
        showTemporaryMessage('Falha ao carregar dados. Verifique o link da planilha e as permissões de compartilhamento.');
    }
});

/**
 * Converte texto CSV para um array de objetos
 * @param {string} text - O texto CSV.
 * @returns {Array<Object>}
 */
function parseCSV(text) {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length === headers.length) {
            const rowObject = {};
            headers.forEach((header, index) => {
                rowObject[header] = values[index];
            });
            rows.push(rowObject);
        }
    }
    return rows;
}

/**
 * Renderiza o cabeçalho da tabela dinamicamente
 * @param {Array<string>} headers - Os nomes das colunas.
 */
function renderTableHeader(headers) {
    tableHead.innerHTML = ''; // Limpa o cabeçalho existente
    const headerRow = document.createElement('tr');
    headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
    });
    tableHead.appendChild(headerRow);
}

/**
 * Renderiza o corpo da tabela com os dados fornecidos
 * @param {Array<Object>} data - Os dados a serem exibidos.
 */
function renderTableBody(data) {
    tableBody.innerHTML = ''; // Limpa o corpo da tabela

    if (data.length === 0) {
        showTemporaryMessage('Nenhum resultado encontrado para os filtros aplicados.');
        return;
    }

    data.forEach(row => {
        const tr = document.createElement('tr');
        Object.values(row).forEach(cellText => {
            const td = document.createElement('td');
            td.textContent = cellText;
            tr.appendChild(td);
        });
        tableBody.appendChild(tr);
    });
}

/**
 * Exibe uma mensagem temporária na tabela (para carregamento ou erros)
 * @param {string} message - A mensagem a ser exibida.
 */
function showTemporaryMessage(message) {
    tableBody.innerHTML = `<tr><td colspan="100%" class="no-results-message">${message}</td></tr>`;
}


/**
 * Aplica os filtros com base nos valores selecionados e no texto digitado
 */
function applyFilters() {
    const undValue = undFilter.value;
    const setorValue = setorFilter.value;
    const nomeValue = nomeFilter.value.toLowerCase();

    // Normaliza os nomes das colunas para garantir a correspondência.
    // O Google Sheets pode nomear as colunas como "FUNCIONARIOS " (com espaço). O trim() resolve isso.
    const undColumn = Object.keys(originalData[0]).find(k => k.trim().toUpperCase() === 'UND');
    const setorColumn = Object.keys(originalData[0]).find(k => k.trim().toUpperCase() === 'SETOR');
    const nomeColumn = Object.keys(originalData[0]).find(k => k.trim().toUpperCase() === 'FUNCIONARIOS');
    
    if (!undColumn || !setorColumn || !nomeColumn) {
        console.error("Não foi possível encontrar as colunas 'UND', 'SETOR' ou 'FUNCIONARIOS' na sua planilha. Verifique os nomes dos cabeçalhos.");
        showTemporaryMessage("Erro: Verifique os nomes das colunas na planilha.");
        return;
    }

    const filteredData = originalData.filter(row => {
        const undMatch = !undValue || (row[undColumn] && row[undColumn].toUpperCase() === undValue);
        const setorMatch = !setorValue || (row[setorColumn] && row[setorColumn].toUpperCase() === setorValue);
        const nomeMatch = !nomeValue || (row[nomeColumn] && row[nomeColumn].toLowerCase().includes(nomeValue));
        return undMatch && setorMatch && nomeMatch;
    });

    renderTableBody(filteredData);
}

// Adiciona os "escutadores" de eventos para os filtros
undFilter.addEventListener('change', applyFilters);
setorFilter.addEventListener('change', applyFilters);
nomeFilter.addEventListener('input', applyFilters);