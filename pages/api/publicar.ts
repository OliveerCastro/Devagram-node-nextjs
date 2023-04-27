import nc from 'next-connect';
import type { NextApiResponse } from 'next';
import { UsuarioModel } from '../../models/UsuarioModel'
import { PublicarModel } from "../../models/PublicarModel"; 
import { politicaCORS } from '../../middlewares/politicaCORS';
import { conectarMongoDB } from '../../middlewares/conectarMongoDB';
import { validarTokenJWT } from '../../middlewares/validarTokenJWT';
import type { RespostaPadraoMsg } from '../../types/RespostaPadraoMsg';
import { upload, uploadImagemCosmic } from '../../services/uploadImagemCosmic';

const handler = nc()
    .use(upload.single('file'))
    .post(async (req: any, res: NextApiResponse<RespostaPadraoMsg>) => {
        try {
            const { userId } = req.query;
            const usuario = await UsuarioModel.findById(userId);
            if (!usuario) {
                return res.status(400).json({ 
                    erro: 'Usuário não encontrado' 
                })
            }

            if (!req || !req.body) {
                return res.status(400).json({ 
                    erro: 'Parametros de entrada inválidos' 
                })
            }
            const { descricao, file } = req?.body

            if (!descricao || descricao.length < 2) {
                return res.status(400).json({ 
                    erro: 'Descricao necessaria' 
                })
            }
            if (!req.file || !req.file.originalname) {
                return res.status(400).json({ 
                    erro: 'Imagem Obrigatória' 
                })
            }

            const image = await uploadImagemCosmic(req);
            const publicar = {
                descricao,
                data: new Date(),
                foto: image.media.url,
                idUsuario: usuario._id
            }

            usuario.publicar++
            await UsuarioModel.findByIdAndUpdate({
                _id : usuario._id}, 
                usuario)
            
            await PublicarModel.create(publicar)
            return res.status(200).json({ 
                erro: 'Publicação criada com sucesso' 
            })

        } catch (e) {
            console.log(e)
            return res.status(400).json({ 
                erro: 'erro ao cadastrar publicação' 
            })
        }
    });

// Define as configurações da API
export const config = {
    api: {
        bodyParser: false
    }
}

// Exporta o handler com os middlewares aplicados
export default politicaCORS(validarTokenJWT(conectarMongoDB(handler)));