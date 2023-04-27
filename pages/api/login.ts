/* eslint-disable import/no-anonymous-default-export */
import md5 from 'md5';
import jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from "next";
import { UsuarioModel } from '../../models/UsuarioModel';
import { politicaCORS } from '../../middlewares/politicaCORS';
import type { LoginResposta } from "../../types/LoginResposta";
import { RespostaPadraoMsg } from "../../types/RespostaPadraoMsg";
import { conectarMongoDB } from '../../middlewares/conectarMongoDB';

const endpointLogin = async (
    req : NextApiRequest,
    res : NextApiResponse<RespostaPadraoMsg | LoginResposta>
) => {
    const {MINHA_CHAVE_JWT} = process.env
    if(!MINHA_CHAVE_JWT){
        return res.status(500).json({erro : 'ENV Jwt não informada'})
    }

    if(req.method === 'POST') {
        const {login, senha} = req.body
        
        const usuariosEncontrados = await UsuarioModel.find({email : login, senha : md5(senha)})
        if(usuariosEncontrados && usuariosEncontrados.length > 0){
                const usuarioEncontrado = usuariosEncontrados[0]

                const token = jwt.sign({_id : usuarioEncontrado._id}, MINHA_CHAVE_JWT)

                return res.status(200).json({
                    nome : usuarioEncontrado.nome,
                    email : usuarioEncontrado.email,
                    token
                })
            }
            return res.status(400).json({erro : 'Usuario ou senha não encontrado'})
    }
    // 405 metodo não permitido
    return res.status(405).json({erro : 'Método informado não é válido'})
}

export default politicaCORS(conectarMongoDB(endpointLogin))