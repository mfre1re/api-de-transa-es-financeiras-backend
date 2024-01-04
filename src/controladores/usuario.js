const pool = require('../conexao/conexao')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const senhaUnica = require('../seguranca/senha_unica')
const { criptografarSenha } = require('../seguranca/autenticacao_criptografia')


const validarDados = (req, res, nome, email, senha) => {
    for (let validador of Object.keys({ nome, email, senha })){
        if(!req.body[ validador ]){
            return res.status(400).json({ mensage: `É obrigatório preecher o campo ${ validador }` })
        }
    }
}

const cadastrarUsuario = async ( req, res ) => {
    const { nome, email, senha } = req.body
    if(validarDados(req, res, nome, email, senha)){
        return
    }

    try{         
        const usuarioCadastrado = await criptografarSenha( nome, email, senha )
        return res.status(200).json(usuarioCadastrado)
    } catch(error){
        if(error.constraint === 'usuarios_email_key'){
            return res.status(400).json({ mensagem: "Já existe usuário cadastrado com o e-mail informado." })
        } else{
            return res.status(500).json( "Erro interno do servidor" )
        }
    }
}

const login = async (req, res) => {
    const { email, senha } = req.body
    for (let validador of Object.keys({ email, senha })){
        if(!req.body[validador]){
            return res.status(400).json({ mensage: `É obrigatório preecher o campo ${validador}` })
        }
    }

    try{
        const usuario = await pool.query( 'select * from usuarios where email = $1', [ email ] )
        if( usuario.rowCount < 1 ){
            return res.status(400).json({ mensagem: 'Usuário e/ou senha inválidos(s).' })
        }

        const senhaValida = await bcrypt.compare( senha, usuario.rows[0].senha )
        if(!senhaValida || usuario.rowCount < 1){
            return res.status(400).json({ mensagem: "Usuário e/ou senha inválidos(s)." })
        }

        const token = jwt.sign({ id: usuario.rows[0].id }, senhaUnica, { expiresIn: '8h' })
        const { senha: _, ...usuarioCadastrado } = usuario.rows[0]
        return res.json({ usuario: usuarioCadastrado, token } )

    } catch( error ){
        console.log( error.message )
        return res.status(500).json( "Erro interno do servidor" )
    }
}

const mostrarUsuario = async (req, res) => {
    try{     
        const usuario = req.usuario
        const { senha: _, ...usuarioCadastrado  } = usuario.rows[0]
        return res.json( usuarioCadastrado )
    } catch( error ){
        console.log( error.message )
        return res.status(500).json( "Erro interno do servidor" )
    }

}

const atualizarUsuario = async (req, res) => {
    const { nome, email, senha } = req.body
    if(validarDados( req, res, nome, email, senha )){
        return
    }

    try{
        const validandoToken = req.usuario 
        const validandoEmail = await pool.query('select * from usuarios where email = $1', [email]) 

        if( validandoEmail.rowCount > 0 && validandoEmail.rows[0].id !== validandoToken.rows[0].id){
            return res.status(400).json({ mensagem: "O e-mail informado já está sendo utilizado por outro usuário." })
        }      
        criptografarSenha(nome, email, senha, validandoToken.rows[0].id )
        return res.status(200).json("Atualização realizada com sucesso!")

    } catch( error ){
        console.log( error.message )
        return res.status(500).json( "Erro interno do servidor" )
    }
}

module.exports = { 
    cadastrarUsuario,
    login,
    mostrarUsuario,
    atualizarUsuario,
}
