import mongoose, { Schema } from "mongoose";

const SeguidorSchema = new Schema({
    // Quem segue
    usuarioId : {type : String, required : true},
    // Quem está seguindo
    usuarioSeguidoId : {type : String, required : true}
})

export const SeguidorModel = (mongoose.models.seguidores ||
    mongoose.model('seguidores', SeguidorSchema)
)