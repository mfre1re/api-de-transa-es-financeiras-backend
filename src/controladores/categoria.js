const pool = require('../conexao/conexao')
const { format } = require('date-fns')

const formatarRegistro = (registro) => {
    const resposta = {
        id: registro.id,
        tipo: registro.tipo,
        descricao: registro.descricao,
        valor: registro.valor,
        data: registro.data,
        usuario_id: registro.usuario_id,
        categoria_id: registro.categoria_id,
        categoria_nome: registro.descricao
    }
    return resposta
}

const listarCategorias = async (req, res) => {
    try{
        const { id } = req.usuario.rows[0]
        if(!id){
            return res.status(401).json("Não autorizado")
        }
        const categorias = await pool.query('select * from categorias*')
        return res.status(200).json(categorias.rows)
    } catch(error){
        console.log(error.message)
        return res.status(500).json({ messagem: "Erro interno do servidor" })
    }
}

const listarTransacoes = async (req, res) => {
    const { filtro } = req.query

    try{
        const { id } = req.usuario.rows[0]
        let resultado = []
        if(filtro && filtro.length > 0){
            for (let filtrar of filtro){
                const palavra = filtrar[0].toUpperCase() + filtrar.slice(1)
                const filter = await pool.query('select * from transacoes where usuario_id = $1 and descricao = $2', [ id, palavra ])
                if(filter.rowCount > 0){
                    resultado.push(filter.rows[0]) 
                }
            }
            return res.status(200).json(resultado) 
        }
       
        const transacoesUsuario = await pool.query('select * from transacoes where usuario_id = $1', [id])

        return res.status(200).json(transacoesUsuario.rows)     
    } catch(error){
        console.log(error.message)
        return res.status(500).json({ mensagem: "Erro interno do servidor" })
    }
}

const detalharTransacao = async (req, res) => {
    const { id } = req.params
    const identidade = Number(id)

    try{
        const { id } = req.usuario.rows[0]
        const validandoId = (await pool.query('select id from transacoes where usuario_id = $1 ', [id])).rows
        const buscarId = await validandoId.find((elemento) => {
            return elemento.id === identidade
        })

        if(!buscarId){
            return res.status(400).json({ mensagem: "Transação não encontrada" })
        }

        const registroTransacao = (await pool.query('select * from transacoes where usuario_id = $1 and id = $2', [id, identidade])).rows[0]
        const resposta = formatarRegistro(registroTransacao)
        return res.status(200).json(resposta)
        
    } catch(error){
        console.log(error.message)
        return res.status(500).json({ messagem: "Erro interno do servidor" })
    }
}

const cadastrarTransacao = async (req, res) => {
    const { descricao, valor, data, categoria_id, tipo } = req.body
    for (let validador of Object.keys({ descricao, valor, data, categoria_id, tipo })){
        if(!req.body[ validador ]){
            return res.status(400).json({ mensage: `É obrigatório preecher o campo ${ validador }` })
        }
    }
    try{
        const { id } = req.usuario.rows[0]
        const listaDeCategorias = (await pool.query('select descricao from categorias')).rows.map((elemento) => elemento.descricao).join(', ')
        const descricaoTransacao = await pool.query('select * from categorias where descricao = $1', [ descricao ])
        const validandoCategoriaId = await pool.query('select * from categorias where id = $1 and descricao = $2', [categoria_id, descricao])
        if(!descricaoTransacao.rows[0]){
            return res.status(400).json({ mensagem: `A descrição informada não existe. Por favor escreva alguma das categorias da lista: ${listaDeCategorias}` })
        }
        
        if(!validandoCategoriaId.rows[0]){
            return res.status(400).json({ mensagem: "O ID informado não corresponde a categoria." })
        }

        const tipoFormatado = tipo.toLowerCase()

        if(tipoFormatado !== "entrada" && tipoFormatado !== "saida"){
            return res.status(400).json({ mensagem: "A informação 'tipo' deve ser preenchido apenas como ENTRADA ou SAIDA"})
        }

        const dataFormatada = format(new Date(data), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx")

        const registroTransacao = (await pool.query(
            'insert into transacoes (descricao, valor, data, categoria_id, usuario_id, tipo) values ($1, $2, $3, $4, $5, $6) returning *',
            [descricao, valor, dataFormatada, categoria_id, id, tipoFormatado]
        )).rows[0]
        const resposta = formatarRegistro(registroTransacao)

        return res.status(200).json(resposta)
    } catch(error){
        if(error.message === "Invalid time value"){
            return res.status(400).json({ mensagem: "Formato de data inválido. Verifique se a data foi preenchida ano, mês, dia e se o dia e mês estão dentro de um valor válido." })
        }
        console.log(error.message)
        return res.status(500).json({ mensagem: "Erro interno do servidor" })
    }
}

const atualizarTransacao = async (req, res) => {
    const { id } = req.params
    const buscandoTransacao = await pool.query('select * from transacoes where id = $1', [ id ])
    if(buscandoTransacao.rowCount < 1 || req.usuario.rows[0].id !== buscandoTransacao.rows[0].usuario_id){
        return res.status(404).json({ mensagem: "O ID de transação é inválido" })
    }
    const { descricao, valor, data, categoria_id, tipo } = req.body
    for (let validador of Object.keys({ descricao, valor, data, categoria_id, tipo })){
        if(!req.body[ validador ]){
            return res.status(400).json({ mensage: `É obrigatório preecher o campo ${ validador }` })
        }
    }

    try{
        const validandoCategoriaId = await pool.query('select * from categorias where id = $1 and descricao = $2', [categoria_id, descricao])
        if(!validandoCategoriaId.rows[0]){
            return res.status(400).json({ mensagem: "O ID informado não corresponde a categoria." })
        }
        const dataFormatada = format(new Date(data), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx")
        const modificandoRegistro = await pool.query(
            'update transacoes set descricao = $1, valor = $2, data = $3, categoria_id = $4, tipo = $5 where id = $6 returning descricao, valor, data, categoria_id, tipo', 
        [ descricao, valor, dataFormatada, categoria_id, tipo, id ])
        return res.status(200).json(modificandoRegistro.rows[0])
    } catch( error ){
        console.log(error.message)
        return res.status(500).json( "Erro interno do servidor" )
    }
}

const excluirTransacao = async (req, res) => {
    const { id } = req.params
    const buscandoTransacao = await pool.query('select * from transacoes where id = $1', [ id ])
    if(buscandoTransacao.rowCount < 1 || req.usuario.rows[0].id !== buscandoTransacao.rows[0].usuario_id){
        return res.status(404).json({ mensagem: "O ID de transação é inválido" })
    }
    try{
        const identidade = req.usuario.rows[0].id
        const removerTransacao = await pool.query('delete from transacoes where id = $1 and usuario_id = $2', [ id, identidade ])
        if(removerTransacao.rowCount < 1){
            return res.status(404).json({ mensagem: "Transação não encontrada." })
        }

        return res.json()
    } catch(error){
        console.log(error.message)
        return res.status(500).json('Erro interno do servidor')
    }
}

const obterExtrato = async (req, res) => {
    try{
        const transacoes = await pool.query('select valor, tipo from transacoes where usuario_id = $1', [req.usuario.rows[0].id])

        let entrada = 0
        let saida = 0

        for (let i of transacoes.rows){
            if(i.tipo === 'entrada'){
                entrada += i.valor
            } else{
                saida += i.valor
            }
        }

        const resposta ={
            entrada,
            saida
        }
        
        return res.status(200).json(resposta)
    } catch(error){
        console.log(error.message)
        return res.status(500).json('Erro interno do servidor')
    }
}

module.exports = { 
    listarCategorias, 
    listarTransacoes, 
    detalharTransacao, 
    cadastrarTransacao, 
    atualizarTransacao, 
    excluirTransacao, 
    obterExtrato
}
