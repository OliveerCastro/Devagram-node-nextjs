import { UsuarioModel } from "../../models/UsuarioModel";
import { SeguidorModel } from "../../models/SeguidorModel";
import type { NextApiRequest, NextApiResponse } from "next";
import { politicaCORS } from "../../middlewares/politicaCORS";
import { validarTokenJWT } from "../../middlewares/validarTokenJWT";
import { conectarMongoDB } from "../../middlewares/conectarMongoDB";
import type { RespostaPadraoMsg } from "../../types/RespostaPadraoMsg";

const endpointSeguir = async (
    req : NextApiRequest, 
    res : NextApiResponse<RespostaPadraoMsg>
    ) => {

    try {
        // Emplementando seguir
        if(req.method === 'PUT'){

            const {userId, id} = req?.query            

            /**
             * Dados à receber:
             * id do usuario do token = 
             * usuário logado/autenticado (sujesito da ação)
             * */
            const usuarioLogado = await UsuarioModel.findById(userId)
            if(!usuarioLogado){
                return res.status(400).json({
                    erro : 'Usuário logado não encontrado'
                })
            }

            // id do usuario a ser seguido - query
            const usuarioASerSeguido = await UsuarioModel.findById(id)
            if (!usuarioASerSeguido) {
                return res.status(400).json({
                    erro : 'Usuário a ser seguido não encontrado'
                })
            }

            // Buscando se o usuário Logado segue ou não esse usuário
            const euJaSiguoEsseUsuario = await SeguidorModel.find({
                usuarioId : usuarioLogado._id,
                usuarioSeguidoId : usuarioASerSeguido._id
            })

            if (euJaSiguoEsseUsuario && euJaSiguoEsseUsuario.length > 0) {
                // sinal que já segue esse usuario
                euJaSiguoEsseUsuario.forEach(async(e : any) => 
                    await SeguidorModel.findByIdAndDelete({
                        _id : e._id
                    }))
                
                usuarioLogado.seguindo--
                await UsuarioModel.findByIdAndUpdate({
                    _id : usuarioLogado._id}, 
                    usuarioLogado
                )
                
                usuarioASerSeguido.seguidores--
                await UsuarioModel.findByIdAndUpdate({
                    _id : usuarioASerSeguido._id}, 
                    usuarioASerSeguido
                )

                return res.status(200).json({
                    msg : 'Deixou de seguir o usuário com sucesso'
                })

            } else {
                // sinal que não segue esse usuário                
                const seguidor = {
                    usuarioId : usuarioLogado._id,
                    usuarioSeguidoId : usuarioASerSeguido._id
                }
                
                await SeguidorModel.create(seguidor)

                // adicionar um seguidor no usuario logado
                usuarioLogado.seguindo++
                await UsuarioModel.findByIdAndUpdate({
                    _id : usuarioLogado._id}, 
                    usuarioLogado
                )

                    /**
                     * O usuario seguido, será seguido por um novo usuario
                     * o número de seguidores dele aumentará
                     * */
                    usuarioASerSeguido.seguidores++                    
                    await UsuarioModel.findByIdAndUpdate({
                        _id : usuarioASerSeguido._id},
                        // aqui deu erro
                        usuarioASerSeguido
                    )

                    return res.status(200).json({
                        msg : 'Usuário seguido com sucesso'
                    })
            }

        }

        return res.status(405).json({
            erro : 'Método informado não existe'
        })

    } catch (e) {
        console.log(e)
        return res.status(500).json({
            erro : 'Não foi possível seguir/deseguir o usuario informado'
        })
        
        
    }
}

export default politicaCORS(validarTokenJWT(conectarMongoDB(endpointSeguir)))