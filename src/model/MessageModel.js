import mongoose from 'mongoose';
const Schema = mongoose.Schema

const messageSchema = new Schema({
    _id: { type: String },
    conversationId: { type: String },
    type: { type: String },
    message: { type: String },
    sentTime: { type: String },
    sender: { type: String },
    senderId: { type: String },
    direction: { type: String },
    position: { type: String },
    status: { type: String },
},
{ timestamps: true })

const Message = mongoose.model('message', messageSchema,'message')

export default Message