import mongoose from "mongoose";
import {Bank, 
        Post, 
        Role, 
        User, 
        Socket, 
        Comment, 
        Mail, 
        Bookmark, 
        ContactUs,
      
        tContactUs,
        Share,
        Dblog,
        Conversation,
        Message,
        Follow,
        Session} from '../model'

const modelExists =()=>{
  Bank.find({}, async(err, result) => {
    if (result.length > 0) {
      console.log('Found bank');
    } else {
      console.log('Not found, creating');
      let newSettings = new Bank({});
      await newSettings.save();

      await Bank.deleteMany({})
    }
  });

  Post.find({}, async(err, result) => {
    if (result.length > 0) {
      console.log('Found post');
    } else {
      console.log('Not found, creating');
      let newSettings = new Post({});
      await newSettings.save();

      await Post.deleteMany({})
    }
  });

  Role.find({},async(err, result) =>{
    if (result.length > 0) {
      console.log('Found role');
    } else {
      console.log('Not found, creating');
      let newSettings = new Role({});
      newSettings.save();

      await Role.deleteMany({})
    }
  });

  Socket.find({}, async(err, result)=> {
    if (result.length > 0) {
      console.log('Found socket');
    } else {
      console.log('Not found, creating');
      let newSettings = new Socket({});
      await newSettings.save();

      await Socket.deleteMany({})
    }
  });

  User.find({}, async(err, result)=> {
    if (result.length > 0) {
      console.log('Found user');
    } else {
      console.log('Not found, creating');
      let newSettings = new User({});
      await newSettings.save();

      await User.deleteMany({})
    }
  });

  Comment.find({}, async(err, result)=> {
    if (result.length > 0) {
      console.log('Found Comment');
    } else {
      console.log('Not found, creating');
      let newComments = new Comment({});
      await newComments.save();

      await Comment.deleteMany({})
    }
  });

  Mail.find({}, async(err, result)=> {
    if (result.length > 0) {
      console.log('Found mail');
    } else {
      console.log('Not found, creating');
      let newMails = new Mail({});
      await newMails.save();

      await Mail.deleteMany({})
    }
  });

  Bookmark.find({}, async(err, result)=> {
    if (result.length > 0) {
      console.log('Found Bookmark');
    } else {
      console.log('Not found, creating');
      let newBookmarks = new Bookmark({});
      await newBookmarks.save();

      await Bookmark.deleteMany({})
    }
  });

  ContactUs.find({}, async(err, result)=> {
    if (result.length > 0) {
      console.log('Found ContactUs');
    } else {
      console.log('Not found, creating');
      let newContactUs = new ContactUs({});
      await newContactUs.save();

      await ContactUs.deleteMany({})
    }
  });

  tContactUs.find({}, async(err, result)=> {
    if (result.length > 0) {
      console.log('Found tContactUs');
    } else {
      console.log('Not found, creating');
      let newTContactUs = new tContactUs({});
      await newTContactUs.save();

      await tContactUs.deleteMany({})
    }
  });

  Share.find({}, async(err, result)=> {
    if (result.length > 0) {
      console.log('Found Share');
    } else {
      console.log('Not found, creating');
      let newShare = new Share({});
      await newShare.save();

      await Share.deleteMany({})
    }
  });

  Dblog.find({}, async(err, result)=> {
    if (result.length > 0) {
      console.log('Found Dblog');
    } else {
      console.log('Not found, creating');
      let newDblog = new Dblog({});
      await newDblog.save();

      await Dblog.deleteMany({})
    }
  });

  Conversation.find({}, async(err, result)=> {
    if (result.length > 0) {
      console.log('Found Conversation');
    } else {
      console.log('Not found, creating');
      let newConversation = new Conversation({});
      await newConversation.save();

      await Conversation.deleteMany({})
    }
  });

  Message.find({}, async(err, result)=> {
    if (result.length > 0) {
      console.log('Found Message');
    } else {
      console.log('Not found, creating');
      let newMessage = new Message({});
      await newMessage.save();

      await Message.deleteMany({})
    }
  });

  Follow.find({}, async(err, result)=> {
    if (result.length > 0) {
      console.log('Found Follow');
    } else {
      console.log('Not found, creating');
      let newFollow = new Follow({});
      await newFollow.save();

      await Follow.deleteMany({})
    }
  });

  Session.find({}, async(err, result)=> {
    if (result.length > 0) {
      console.log('Found Session');
    } else {
      console.log('Not found, creating');
      let newSession = new Session({});
      await newSession.save();

      await Session.deleteMany({})
    }
  });

}

// TODO: initial and connect to MongoDB
mongoose.Promise = global.Promise;
// mongoose.connect("YOUR_MONGODB_URI", { useNewUrlParser: true });

// console.log("process.env.MONGO_URI :", process.env)
// uri
mongoose.connect(
  "mongodb://mongo1:27017,mongo2:27017,mongo3:27017/bl?replicaSet=rs",
  {
    useNewUrlParser: true,
    useFindAndModify: false, // optional
    useCreateIndex: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 100000, // Defaults to 30000 (30 seconds)
  }
);

const connection = mongoose.connection;
connection.on("error", console.error.bind(console, "Error : Connection to database"));
connection.once("open", async function () {
  // we're connected!
  console.log("Successfully : Connected to database!");

  modelExists()
});

export default connection;