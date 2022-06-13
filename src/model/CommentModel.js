import mongoose from 'mongoose';

const Schema = mongoose.Schema

const commentSchema = new Schema({
    postId: { type: String },
    body: { type: String },
},
{
    timestamps: true
})

const Comment = mongoose.model('comment', commentSchema,'comment')
export default Comment