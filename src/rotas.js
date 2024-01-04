const express = require('express')
const rotas = express()
const { cadastrarUsuario, login, mostrarUsuario, atualizarUsuario } = require('./controladores/usuario')
const { validarLogin } = require('./seguranca/autenticacao_criptografia')
const { 
    listarCategorias, 
    listarTransacoes, 
    cadastrarTransacao, 
    detalharTransacao, 
    atualizarTransacao, 
    excluirTransacao, 
    obterExtrato 
} = require('./controladores/categoria')

rotas.post('/usuario', cadastrarUsuario)
rotas.post('/login', login)

rotas.use(validarLogin)

rotas.get('/categoria', listarCategorias)
rotas.get('/usuario', mostrarUsuario)
rotas.put('/usuario', atualizarUsuario)
rotas.get('/transacao', listarTransacoes)
rotas.get('/transacao/extrato', obterExtrato)
rotas.get('/transacao/:id', detalharTransacao)
rotas.post('/transacao', cadastrarTransacao)
rotas.put('/transacao/:id', atualizarTransacao)
rotas.delete('/transacao/:id', excluirTransacao)

module.exports = rotas
