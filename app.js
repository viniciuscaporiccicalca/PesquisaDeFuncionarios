document.addEventListener('DOMContentLoaded', () => {
    // Referências aos elementos do DOM
    const tableBody = document.getElementById('table-body');
    const searchInput = document.getElementById('search-input');
    const cadastroForm = document.getElementById('cadastro-form');

    let funcionarios = [];
    let editingIndex = null; // Variável para controlar qual linha está sendo editada

    // Função para buscar e carregar os dados do JSON
    async function carregarFuncionarios() {
        try {
            const response = await fetch('dados.JSON');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            funcionarios = data.FUNCIONARIOS;
            renderTable(funcionarios);
        } catch (error) {
            console.error("Erro ao carregar o arquivo JSON:", error);
            tableBody.innerHTML = `<tr><td colspan="10">Falha ao carregar dados.</td></tr>`;
        }
    }

    // Função para renderizar a tabela
    function renderTable(data) {
        tableBody.innerHTML = '';

        if (data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="10">Nenhum funcionário encontrado.</td></tr>`;
            return;
        }

        data.forEach((func, index) => {
            const isEditing = editingIndex === index;
            const row = document.createElement('tr');

            // Renderiza a linha em modo de edição ou em modo de visualização
            row.innerHTML = `
                <td>${func.NOME || ''}</td>
                <td>${isEditing ? `<input type="text" value="${func.SETOR}" class="edit-input" data-field="SETOR">` : func.SETOR || ''}</td>
                <td>${isEditing ? `<input type="text" value="${func.UND}" class="edit-input" data-field="UND">` : func.UND || ''}</td>
                <td>${func.IDADE || ''}</td>
                <td>${func['MES NASC'] || ''}</td>
                <td>${func['DATA NASC'] || ''}</td>
                <td>${func['TEMPO DE UNIMAKE'] !== undefined ? func['TEMPO DE UNIMAKE'] : ''}</td>
                <td>${func['MES ADM.'] || ''}</td>
                <td>${func['DATA ADM.'] || ''}</td>
                <td class="actions-cell">
                    ${isEditing ? `
                        <button class="action-btn save-btn" data-index="${index}">Salvar</button>
                        <button class="action-btn cancel-btn" data-index="${index}">Cancelar</button>
                    ` : `
                        <button class="action-btn edit-btn" data-index="${index}">Editar</button>
                        <button class="action-btn delete-btn" data-index="${index}">Excluir</button>
                    `}
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    // --- LÓGICA DE EVENTOS (EDIÇÃO, EXCLUSÃO, CADASTRO, BUSCA) ---

    // Delegação de eventos na tabela para gerenciar cliques de ação
    tableBody.addEventListener('click', (event) => {
        const target = event.target;
        const index = parseInt(target.dataset.index, 10);

        // Ação de Excluir
        if (target.classList.contains('delete-btn')) {
            if (confirm(`Tem certeza que deseja excluir ${funcionarios[index].NOME}?`)) {
                funcionarios.splice(index, 1);
                renderTable(funcionarios);
            }
        }
        // Ação de Editar (entrar no modo de edição)
        else if (target.classList.contains('edit-btn')) {
            editingIndex = index;
            renderTable(funcionarios);
        }
        // Ação de Cancelar edição
        else if (target.classList.contains('cancel-btn')) {
            editingIndex = null;
            renderTable(funcionarios);
        }
        // Ação de Salvar edição
        else if (target.classList.contains('save-btn')) {
            const row = target.closest('tr');
            const setorInput = row.querySelector('.edit-input[data-field="SETOR"]');
            const undInput = row.querySelector('.edit-input[data-field="UND"]');

            funcionarios[index].SETOR = setorInput.value.toUpperCase();
            funcionarios[index].UND = undInput.value.toUpperCase();

            editingIndex = null;
            renderTable(funcionarios);
        }
    });

    // Event Listener para o campo de busca
    searchInput.addEventListener('input', () => {
        editingIndex = null; // Cancela a edição ao buscar
        const searchTerm = searchInput.value.toLowerCase();
        const filteredData = funcionarios.filter(func => {
            return (
                (func.NOME && func.NOME.toLowerCase().includes(searchTerm)) ||
                (func.SETOR && func.SETOR.toLowerCase().includes(searchTerm)) ||
                (func.UND && func.UND.toLowerCase().includes(searchTerm))
            );
        });
        renderTable(filteredData);
    });
    
    // Funções de cálculo (sem alterações)
    function calcularIdade(dataNasc) {
        const hoje = new Date("2025-07-06T15:08:13.064Z");
        const nasc = new Date(dataNasc);
        let idade = hoje.getFullYear() - nasc.getFullYear();
        const m = hoje.getMonth() - nasc.getMonth();
        if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) {
            idade--;
        }
        return idade;
    }

    function calcularTempoDeEmpresa(dataAdm) {
        const hoje = new Date("2025-07-06T15:08:13.064Z");
        const adm = new Date(dataAdm);
        let anos = hoje.getFullYear() - adm.getFullYear();
        const m = hoje.getMonth() - adm.getMonth();
        if (m < 0 || (m === 0 && hoje.getDate() < adm.getDate())) {
            anos--;
        }
        return anos;
    }

    // Event Listener para o formulário de cadastro
    cadastroForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const nome = document.getElementById('nome').value;
        const setor = document.getElementById('setor').value;
        const und = document.getElementById('und').value;
        const dataNascInput = document.getElementById('data-nasc').value;
        const dataAdmInput = document.getElementById('data-adm').value;

        const dataNascObj = new Date(dataNascInput + 'T00:00:00');
        const dataAdmObj = new Date(dataAdmInput + 'T00:00:00');
        
        const dataNascFormatada = dataNascObj.toLocaleDateString('pt-BR');
        const dataAdmFormatada = dataAdmObj.toLocaleDateString('pt-BR');

        const novoFuncionario = {
            "NOME": nome,
            "SETOR": setor.toUpperCase(),
            "UND": und.toUpperCase(),
            "IDADE": calcularIdade(dataNascInput),
            "MES NASC": dataNascObj.getMonth() + 1,
            "DATA NASC": dataNascFormatada,
            "TEMPO DE UNIMAKE": calcularTempoDeEmpresa(dataAdmInput),
            "MES ADM.": dataAdmObj.getMonth() + 1,
            "DATA ADM.": dataAdmFormatada
        };

        funcionarios.unshift(novoFuncionario);
        renderTable(funcionarios);
        searchInput.value = '';
        cadastroForm.reset();
    });

    // Inicia a aplicação
    carregarFuncionarios();
});