import { NextApiRequest, NextApiResponse } from "next";
import { UsuarioModel } from "../../models/UsuarioModel";
import { PublicarModel } from "../../models/PublicarModel";
import { politicaCORS } from "../../middlewares/politicaCORS";
import { RespostaPadraoMsg } from "../../types/RespostaPadraoMsg";
import { conectarMongoDB } from "../../middlewares/conectarMongoDB";
import { validarTokenJWT } from "../../middlewares/validarTokenJWT";

const likeEndpoint = async (
    req : NextApiRequest,
    res : NextApiResponse<RespostaPadraoMsg>
) => {
    try {

        if(req.method === 'PUT'){

            // id da publicação - checked
            const {id} = req?.query
            const publicar = await PublicarModel.findById(id)
            if(!publicar){
                return res.status(400).json({
                    erro : 'Publicação não encontrada'
                })
            }

            // id do usuario que curtiu a publicação
            const {userId} =req?.query
            const usuario = await UsuarioModel.findById(userId)
            if(!usuario){
                return res.status(400).json({
                    erro : 'Usuario não encontrado'
                })
            }

            /**
             * Administrando likes
             * se o index for -1 usuario não curtiu a foto
             * se o index for > -1 usuario curtiu a foto
             * */
            const indexUsuarioLike = publicar.likes
            .findIndex((e : any) => e.toString() === usuario._id.toString())

            if(indexUsuarioLike != -1){
                publicar.likes.splice(indexUsuarioLike, 1)
                await PublicarModel.findByIdAndUpdate({
                    _id : publicar._id}, 
                    publicar)
                return res.status(200).json({
                    msg : 'Publicação descurtida com sucesso'
                })

            }else{
                publicar.likes.push(usuario._id)
                await PublicarModel.findByIdAndUpdate({
                    _id : publicar._id}, 
                    publicar)
                return res.status(200).json({
                    msg : 'Publicação curtida com sucesso'
                })    
            }

        }

        return res.status(405).json({
            erro : 'Método informado não é válido'
        })


    } catch (e) {
        console.log(e);
        return res.status(500).json({
            erro : 'Ocorreu erro ao curtir/descurtir uma publicação'
        })


    }
}

export default politicaCORS(validarTokenJWT(conectarMongoDB(likeEndpoint)))
