const express = require('express')
const rotas = require('./rotas')
const servidor = express()

servidor.use(express.json())
servidor.use(rotas)

const porta = 3000
servidor.listen(porta, () => {
    console.log(`Conectado a porta ${porta}`)
})
