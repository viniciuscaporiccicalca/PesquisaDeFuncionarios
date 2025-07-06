document.addEventListener('DOMContentLoaded', () => {
    // Referências aos elementos do DOM
    const tableBody = document.getElementById('table-body');
    const searchInput = document.getElementById('search-input');
    const cadastroForm = document.getElementById('cadastro-form');

    let funcionarios = [];

    // Função para buscar e carregar os dados do JSON
    async function carregarFuncionarios() {
        try {
            const response = await fetch('dados.JSON');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            funcionarios = data.FUNCIONARIOS; // Pega a lista de funcionários do JSON
            renderTable(funcionarios);
        } catch (error) {
            console.error("Erro ao carregar o arquivo JSON:", error);
            tableBody.innerHTML = `<tr><td colspan="9">Falha ao carregar os dados. Verifique o console para mais informações.</td></tr>`;
        }
    }

    // Função para renderizar a tabela com os dados dos funcionários
    function renderTable(data) {
        tableBody.innerHTML = ''; // Limpa a tabela antes de renderizar

        if (data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="9">Nenhum funcionário encontrado.</td></tr>`;
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

    // Função para calcular idade
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

    // Função para calcular o tempo de empresa
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

    // Event Listener para o campo de busca
    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredData = funcionarios.filter(func => {
            return (
                func.NOME.toLowerCase().includes(searchTerm) ||
                func.SETOR.toLowerCase().includes(searchTerm) ||
                func.UND.toLowerCase().includes(searchTerm)
            );
        });
        renderTable(filteredData);
    });

    // Event Listener para o formulário de cadastro
    cadastroForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Impede o recarregamento da página

        const nome = document.getElementById('nome').value;
        const setor = document.getElementById('setor').value;
        const und = document.getElementById('und').value;
        const dataNascInput = document.getElementById('data-nasc').value; // Formato YYYY-MM-DD
        const dataAdmInput = document.getElementById('data-adm').value;   // Formato YYYY-MM-DD

        // Converte data para o formato DD/MM/YYYY
        const dataNascObj = new Date(dataNascInput + 'T00:00:00'); // Adiciona T00:00:00 para evitar problemas de fuso
        const dataAdmObj = new Date(dataAdmInput + 'T00:00:00');
        
        const dataNascFormatada = dataNascObj.toLocaleDateString('pt-BR');
        const dataAdmFormatada = dataAdmObj.toLocaleDateString('pt-BR');

        // Cria o novo objeto de funcionário
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

        // Adiciona o novo funcionário ao array (apenas em memória)
        funcionarios.unshift(novoFuncionario); // Adiciona no início do array

        // Re-renderiza a tabela
        renderTable(funcionarios);
        
        // Limpa o campo de busca se houver texto
        searchInput.value = '';

        // Limpa o formulário
        cadastroForm.reset();
    });

    // Inicia a aplicação
    carregarFuncionarios();
});