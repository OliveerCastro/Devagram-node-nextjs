import { UsuarioModel } from "../..//models/UsuarioModel";
import { PublicarModel } from "../../models/PublicarModel";
import { SeguidorModel } from "../../models/SeguidorModel";
import type { NextApiRequest, NextApiResponse } from "next";
import { politicaCORS } from "../../middlewares/politicaCORS";
import { validarTokenJWT } from "../../middlewares/validarTokenJWT";
import { conectarMongoDB } from "../../middlewares/conectarMongoDB";
import type { RespostaPadraoMsg } from '../../types/RespostaPadraoMsg';

const feedEndpoint = async (req : NextApiRequest, res : NextApiResponse<RespostaPadraoMsg | any>) => {
    try {
        if (req.method === 'GET') {
            /**
             * Recebendo informação do id do usuario
             * para buscar o feed
             */
            if(req?.query?.id){
                /**
                 * Com o usuario do id, 
                 * faz a sua validação
                 * se ele for válido
                 */
                const usuario = await UsuarioModel
                    .findById(req?.query?.id)
                if (!usuario) {
                    return res.status(400).json({
                        erro : 'Usuario não encontrado'
                    })
                }
                console.log(usuario);
                
                // Buscando a publicação do usuario
                const publicar = await PublicarModel
                    .find({idUsuario : usuario._id})
                    .sort({data : -1})
                    
                    console.log(publicar);
                    
                    return res.status(200).json(publicar)
            }else {
                const {userId} = req.query

                const usuarioLogado = await UsuarioModel.findById(userId)
                if(!usuarioLogado){
                    return res.status(400).json({
                        erro : 'Usuário não encontrado'
                    })
                }

                const seguidores = await SeguidorModel.find({
                    usuarioId : usuarioLogado
                })

                const seguidoresIds = seguidores.map(s => s.usuarioSeguidoId)
                const publicar = await PublicarModel.find({
                    $or : [
                        {idUsuario : usuarioLogado._id},
                        {idUsuario : seguidoresIds} 
                    ]
                })
                .sort({data : -1})

                const result = []
                for(const publicacao of publicar){
                    const usuarioDaPublicacao = await UsuarioModel.findById(publicacao.idUsuario)
                    if(usuarioDaPublicacao){
                        const final = {
                            ...publicacao.doc, usuario : {
                                nome : usuarioDaPublicacao.nome, 
                                avatar : usuarioDaPublicacao.avatar
                            }
                        }
                        result.push(final)
                    }
                }

                return res.status(200).json(result)
            }
        }

        return res.status(405).json({
            erro : 'Método informado não é válido'
        })
    } catch (e) {
        console.log(e);
    }

    return res.status(400).json({
        erro : 'Não foi possível obter o feed'
    })
}

export default politicaCORS(validarTokenJWT(conectarMongoDB(feedEndpoint)))