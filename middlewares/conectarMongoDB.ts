import type {NextApiRequest, NextApiResponse, NextApiHandler} from 'next';
import mongoose from 'mongoose';
import type {RespostaPadraoMsg} from '../types/RespostaPadraoMsg';

export const conectarMongoDB = (handler : NextApiHandler) =>
    async (req: NextApiRequest, res : NextApiResponse<RespostaPadraoMsg | any[]>) => {

        // Verificar a conexão do banco, se estiver conectado seguir para o endpoint
    if(mongoose.connections[0].readyState){
        return handler(req, res)
    }

        /** 
         * Se houver conexão, temos que conectar
         * Temos que obter a varialvel de ambiente preenchida do env
         * */
         const {DB_CONEXAO_STRING} = process.env

        /** 
         * Se a env estiver vazia, o sistema tem que ser abortado e avisado ao programador
         * */
         if(!DB_CONEXAO_STRING){
        return res.status(500).json({ erro : 'ENV de configuracao do banco, nao informado'})
    }

        mongoose.connection.on('connected', () => console.log('Banco de dados conectado'))
        mongoose.connection.on('error', error => console.log(`Ocorreu erro ao conectar no banco: ${error}`))
        await mongoose.connect(DB_CONEXAO_STRING)

        /** 
         * Agora pode seguir para o endpoint, pois o banco está conectado
         * */
       return handler(req, res)
    }
