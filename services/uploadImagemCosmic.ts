import multer from "multer";
import cosmicjs from "cosmicjs"

const{
    CHAVE_GRAVACAO_AVATARES,
    CHAVE_GRAVACAO_PUBLICACOES,
    BUCKET_AVATARES,
    BUCKET_PUBLICACOES } = process.env

    // Criação das estacias do cosmicjs
    const Cosmic = cosmicjs()
    const bucketAvatares =  Cosmic.bucket({
        slug : BUCKET_AVATARES,
        write_key : CHAVE_GRAVACAO_AVATARES
    })

    const bucketPublicacoes = Cosmic.bucket({
        slug : BUCKET_PUBLICACOES,
        write_key : CHAVE_GRAVACAO_PUBLICACOES
    })

    // Subido em memoria, usando multer, e depois enviando para o cosmicjs
    const storage = multer.memoryStorage()
    const upload = multer({storage : storage})

    // Subindo arquivo, se tiver nome cria um objeto, esperado pelo cosmicjs
    const uploadImagemCosmic = async(req : any) =>{
        if(req?.file?.originalname){

            if (!req.file.originalname.includes('.png') &&
                !req.file.originalname.includes('.jpg') &&
                !req.file.originalname.includes('.jpeg')){
                    throw new Error('Extenção da imagem inválida')
            }

            const media_object = {
                originalname: req.file.originalname,
                buffer : req.file.buffer
            }

            // Com esse objeto checa-se  a url, se for publicação envia para o bucket de publicação
            if(req.url && req.url.includes('publicacao')){
                return await bucketPublicacoes.addMedia({media : media_object})
            }else{
                return await bucketAvatares.addMedia({media : media_object})
            }
        }

    }

    export {upload, uploadImagemCosmic} 
