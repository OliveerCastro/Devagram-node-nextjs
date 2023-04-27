import nc from 'next-connect';
import { UsuarioModel } from "../../models/UsuarioModel";
import type { NextApiRequest, NextApiResponse } from "next";
import { politicaCORS } from '../../middlewares/politicaCORS';
import { validarTokenJWT } from "../../middlewares/validarTokenJWT";
import { conectarMongoDB } from "../../middlewares/conectarMongoDB";
import type { RespostaPadraoMsg } from '../../types/RespostaPadraoMsg';
import { upload, uploadImagemCosmic } from "../../services/uploadImagemCosmic";

const handler = nc()
    .use(upload.single('file'))
    .put(async(
        req : any, 
        res : NextApiResponse<RespostaPadraoMsg>) => {
            try {
                /**
                 * Para alterar o usuário é preciso
                 * primeiro pegar o usuario no DB
                 * */
                const {userId} = req?.query
                const usuario = await UsuarioModel.findById(userId)

                /**
                 * Se existe usuário ele retorna algo.
                 *  Se não retornar ele não existe.
                 * */
                if (!usuario) {
                    return res.status(400).json({
                        erro : 'Usuário não encontrado'
                    })
                }

           const {nome} = req.body
           if(nome && nome.length > 2){
                usuario.nome = nome
           }

           const {file} = req
           if(file && file.originalname){
                const image = await uploadImagemCosmic(req)
                if(image && image.media && image.media.url){
                    usuario.avatar = image.media.url
                }
           }

           // Alteramdo os dados do DB
           await UsuarioModel.findByIdAndUpdate({_id : usuario._id}, usuario)

            return res.status(200).json({
                msg : 'Usuário alterado com sucesso'
           })

            } catch (e) {
                console.log(e);
                return res.status(400).json({
                    erro : 'Não foi possível atualizar o usuário:' + e
                   })
            }

        })
        .get(async (req : NextApiRequest, res : NextApiResponse<RespostaPadraoMsg>) => {
            
            try {
                // Buscando todos os dados do usuario
                const {userId} = req?.query
                const usuario = await UsuarioModel.findById(userId)
                usuario.senha = null
                return res.status(200).json(usuario)
        
            } catch (e) {
                console.log(e);
                return res.status(400).json({
                    erro : 'Não foi possível obter dados do usuario'
                })
            }
            
        })

export const config = {
    api : {
        bodyParser : false
    }
}

export default validarTokenJWT(politicaCORS(conectarMongoDB(handler))) 
