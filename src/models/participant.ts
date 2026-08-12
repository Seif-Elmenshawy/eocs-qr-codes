import mongoose, {Schema, models, model} from "mongoose";

export interface IParticipant {
    _id: string
    name: string
    id_card: string
    got_on_the_bus:boolean
    entered_uni: boolean
    ate: boolean
    left_uni: boolean
}

const ParticipantSchema = new Schema<IParticipant>({
    name: {type: String, required: true},
    id_card: {type:String, required: true},
    got_on_the_bus: {type:Boolean, required:true},
    entered_uni: {type:Boolean, required:true},
    ate: {type: Boolean, required: true},
    left_uni: {type: Boolean, required: true}
})

export default models.Participant || model<IParticipant>("Participant", ParticipantSchema, "Participant")