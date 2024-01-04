const pool = require('../conexao/conexao')
const senha_unica = require("./senha_unica")
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')


const criptografarSenha = async ( nome, email, senha, id = null ) => {
    const senhaCriptografada = await bcrypt.hash(senha, 10)
    if (id){
        pool.query('update usuarios set nome = $1, email = $2, senha = $3 where id = $4',
        [ nome, email, senhaCriptografada, id ])
    } else{
        const cadastro = await pool.query('insert into usuarios (nome, email, senha) values ($1, $2, $3) returning *',
        [ nome, email, senhaCriptografada ])
        const { senha: _, ...usuarioCadastrado } = cadastro.rows[0]
        return usuarioCadastrado
    }   
}

const validarLogin = async (req, res, next) => {
    try {
        const { authorization } = req.headers
        if (!authorization){
            return res.status(401).json({ mensagem: "Para acessar este recurso um token de autenticação válido deve ser enviado." })
        }

        const token = authorization.split(' ')[1]
        const { id } = jwt.verify( token, senha_unica ) 
        const { rows, rowCount } = await pool.query('select * from usuarios where id = $1', [id])
        if(rowCount < 1){
            return res.status(401).json({ mensagem: "Não autorizado" })
        }

        req.usuario = { rows, rowCount }       
        next()

    } catch(error){
        if(error.message === "invalid signature"){
            return res.status(401).json({ mensagem: "Não autorizado!" })
        } 
        
        if(error.message === "jwt must be provided"){
            return res.status(401).json({ mensagem: "Não autorizado!" })
        } 
        
        if (error.message === "jwt expired"){
            return res.status(401).json({ mensagem: "Token expirado" })
        } 

        console.log(error.message)
        return res.status(500).json( "Erro interno do servidor" )
        
    }
}

module.exports = { criptografarSenha, validarLogin }
