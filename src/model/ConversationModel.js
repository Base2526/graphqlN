import mongoose from 'mongoose';

const Schema = mongoose.Schema

const conversationSchema = new Schema({
    members: [String],
},
{
    timestamps: true
})

const Conversation = mongoose.model('conversation', conversationSchema,'conversation')
export default Conversation