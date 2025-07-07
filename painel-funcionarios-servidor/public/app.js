document.addEventListener('DOMContentLoaded', () => {
    // --- NOVO: Definindo a URL base do servidor ---
    const API_URL = 'http://localhost:3000/api/funcionarios';

    // Referências aos elementos do DOM
    const tableBody = document.getElementById('table-body');
    const searchInput = document.getElementById('search-input');
    const cadastroForm = document.getElementById('cadastro-form');
    
    const filterAniversario = document.getElementById('filter-aniversario');
    const filterAdmissao = document.getElementById('filter-admissao');
    const filterTempo = document.getElementById('filter-tempo');
    const clearFiltersBtn = document.getElementById('clear-filters-btn');

    let funcionarios = [];

    function popularFiltroTempo() {
        for (let i = 0; i <= 40; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `${i} ano(s)`;
            filterTempo.appendChild(option);
        }
    }

    // --- FUNÇÃO MODIFICADA ---
    // Agora usa a constante API_URL para buscar os dados
    async function carregarFuncionarios() {
        try {
            const response = await fetch(API_URL); // <-- MUDANÇA AQUI
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            funcionarios = await response.json(); 
            aplicarFiltros();
        } catch (error) {
            console.error("Erro ao carregar dados do servidor:", error);
            tableBody.innerHTML = `<tr><td colspan="9">Falha ao carregar os dados. Verifique se o servidor está rodando.</td></tr>`;
        }
    }

    function renderTable(data) {
        tableBody.innerHTML = ''; 

        if (data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="9">Nenhum funcionário encontrado com os filtros aplicados.</td></tr>`;
            return;
        }

        data.forEach(func => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${func.NOME || ''}</td>
                <td>${func.SETOR || ''}</td>
                <td>${func.UND || ''}</td>
                <td>${func.IDADE || ''}</td>
                <td>${func['MES NASC'] || ''}</td>
                <td>${func['DATA NASC'] || ''}</td>
                <td>${func['TEMPO DE UNIMAKE'] !== undefined ? func['TEMPO DE UNIMAKE'] : ''}</td>
                <td>${func['MES ADM.'] || ''}</td>
                <td>${func['DATA ADM.'] || ''}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    function aplicarFiltros() {
        const searchTerm = searchInput.value.toLowerCase();
        const mesAniversario = filterAniversario.value;
        const mesAdmissao = filterAdmissao.value;
        const tempoEmpresa = filterTempo.value;

        let filteredData = funcionarios;

        if (searchTerm) {
            filteredData = filteredData.filter(func =>
                (func.NOME?.toLowerCase().includes(searchTerm) ||
                 func.SETOR?.toLowerCase().includes(searchTerm) ||
                 func.UND?.toLowerCase().includes(searchTerm))
            );
        }
        if (mesAniversario) {
            filteredData = filteredData.filter(func => func['MES NASC'] == mesAniversario);
        }
        if (mesAdmissao) {
            filteredData = filteredData.filter(func => func['MES ADM.'] == mesAdmissao);
        }
        if (tempoEmpresa !== '') {
            filteredData = filteredData.filter(func => func['TEMPO DE UNIMAKE'] == tempoEmpresa);
        }
        renderTable(filteredData);
    }

    function calcularIdade(dataNasc) {
        const hoje = new Date();
        const nasc = new Date(dataNasc);
        let idade = hoje.getFullYear() - nasc.getFullYear();
        const m = hoje.getMonth() - nasc.getMonth();
        if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) {
            idade--;
        }
        return idade;
    }

    function calcularTempoDeEmpresa(dataAdm) {
        const hoje = new Date();
        const adm = new Date(dataAdm);
        let anos = hoje.getFullYear() - adm.getFullYear();
        const m = hoje.getMonth() - adm.getMonth();
        if (m < 0 || (m === 0 && hoje.getDate() < adm.getDate())) {
            anos--;
        }
        return anos;
    }

    searchInput.addEventListener('input', aplicarFiltros);
    filterAniversario.addEventListener('change', aplicarFiltros);
    filterAdmissao.addEventListener('change', aplicarFiltros);
    filterTempo.addEventListener('change', aplicarFiltros);
    
    clearFiltersBtn.addEventListener('click', () => {
        searchInput.value = '';
        filterAniversario.value = '';
        filterAdmissao.value = '';
        filterTempo.value = '';
        aplicarFiltros();
    });

    // --- FUNÇÃO MODIFICADA ---
    // Agora usa a constante API_URL para enviar (POST) os dados
    cadastroForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        // (código para coletar os dados do formulário continua o mesmo)
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

        try {
            const response = await fetch(API_URL, { // <-- MUDANÇA AQUI
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(novoFuncionario),
            });

            if (!response.ok) {
                throw new Error('Falha ao cadastrar funcionário no servidor.');
            }

            await carregarFuncionarios(); 
            cadastroForm.reset();

        } catch (error) {
            console.error("Erro ao cadastrar funcionário:", error);
            alert("Não foi possível cadastrar o funcionário. Tente novamente.");
        }
    });

    // Inicia a aplicação
    popularFiltroTempo();
    carregarFuncionarios();
});