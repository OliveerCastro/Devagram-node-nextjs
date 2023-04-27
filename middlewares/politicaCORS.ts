import NextCors from "nextjs-cors";
import type { RespostaPadraoMsg } from "../types/RespostaPadraoMsg";
import type { NextApiRequest, NextApiResponse, NextApiHandler } from "next";

export const politicaCORS = (
    handler : NextApiHandler) => async (
        req : NextApiRequest, 
        res : NextApiResponse<RespostaPadraoMsg>) => {

    try {

        await NextCors(req, res,{
            origin : '*',
            methods : ['GET', 'POST', 'PUT'],
            /**
             * Navegadores antigos dão
             * problemas quando retorna 204
             * */
            optionsSuccessStatus : 200,
        })
        return handler(req, res)
        
    } catch (e) {
        console.log('Erro ao tratar a política de CORS:', e);
        res.status(500).json({
            erro : 'Ocorreu erro ao tratar a política de CORS'
        })
    }
}