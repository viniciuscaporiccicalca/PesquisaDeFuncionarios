// 1. Importar os módulos necessários
const express = require('express'); // Framework para criar o servidor
const fs = require('fs');         // Módulo para interagir com o sistema de arquivos (ler/escrever JSON)
const path = require('path');     // Módulo para trabalhar com caminhos de arquivos

// 2. Inicializar o Express e definir a porta
const app = express();
const PORT = 3000; // O servidor rodará na porta 3000

// 3. Configurar os "Middlewares"
// Middleware para servir arquivos estáticos (html, css, js) da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));
// Middleware para o servidor entender requisições com corpo em formato JSON
app.use(express.json());

const dadosPath = path.join(__dirname, 'dados.JSON');

// 4. Criar as rotas da API

// ROTA GET: Para buscar todos os funcionários
app.get('/api/funcionarios', (req, res) => {
    fs.readFile(dadosPath, 'utf8', (err, data) => {
        if (err) {
            console.error("Erro ao ler o arquivo dados.JSON:", err);
            return res.status(500).send('Erro ao ler os dados do servidor.');
        }
        try {
            const jsonData = JSON.parse(data);
            res.json(jsonData.FUNCIONARIOS); // Envia apenas o array de funcionários
        } catch (parseErr) {
            console.error("Erro ao fazer o parse do JSON:", parseErr);
            return res.status(500).send('Erro no formato do arquivo de dados.');
        }
    });
});

// ROTA POST: Para cadastrar um novo funcionário
app.post('/api/funcionarios', (req, res) => {
    const novoFuncionario = req.body; // O novo funcionário enviado pelo front-end

    // Primeiro, lemos o arquivo existente
    fs.readFile(dadosPath, 'utf8', (err, data) => {
        if (err) {
            console.error("Erro ao ler o arquivo dados.JSON:", err);
            return res.status(500).send('Erro ao ler os dados do servidor para salvar.');
        }
        try {
            const jsonData = JSON.parse(data);
            
            // Adiciona o novo funcionário no início do array
            jsonData.FUNCIONARIOS.unshift(novoFuncionario);
            
            // Recalcula o total de funcionários
            jsonData.Total.TOTAL_FUNCIONARIOS = jsonData.FUNCIONARIOS.length;
            
            // Escreve os dados atualizados de volta no arquivo JSON
            // JSON.stringify(jsonData, null, 2) formata o JSON para ficar legível
            fs.writeFile(dadosPath, JSON.stringify(jsonData, null, 2), 'utf8', (writeErr) => {
                if (writeErr) {
                    console.error("Erro ao escrever no arquivo dados.JSON:", writeErr);
                    return res.status(500).send('Erro ao salvar o novo funcionário.');
                }
                console.log('Novo funcionário cadastrado com sucesso:', novoFuncionario.NOME);
                res.status(201).json(novoFuncionario); // Responde com sucesso (201 Created)
            });

        } catch (parseErr) {
            console.error("Erro ao fazer o parse do JSON:", parseErr);
            return res.status(500).send('Erro no formato do arquivo de dados.');
        }
    });
});


// 5. Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});