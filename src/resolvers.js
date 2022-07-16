import { PubSub } from "graphql-subscriptions";
import jwt from 'jsonwebtoken';

import {Bank, 
        Post, 
        Role, 
        User, 
        Comment, 
        Mail, 
        Socket, 
        Bookmark, 
        ContactUs, 
        tContactUs, 
        Share, 
        Dblog,
        Conversation,
        Message,
        BasicContent,
        Follow,
        Session} from './model'
import {emailValidate} from './utils'

// const logger = require('./utils/logger');
const _ = require("lodash");

const pubsub = new PubSub();

export default {
  Query: {

   

    // user
    async user(parent, args, context, info) {
      let start = Date.now()

      if(!context.status){
        // foce logout
      }

      let {_id} = args

      // console.log("User : >> ", _id)
      let data = await User.findById(_id);
      return {
        status:true,
        messages: "", 
        data,
        executionTime: `Time to execute = ${
          (Date.now() - start) / 1000
        } seconds`
      }
    },
    async Users(root, {
      page,
      perPage
    }) {

      let start = Date.now()

      // console.log("users: page : ", page,
      //             ", perPage : ", perPage,
      //             `Time to execute = ${
      //               (Date.now() - start) / 1000
      //             } seconds` )

      // let data = await User.find();
      let data = await  User.find({}).limit(perPage).skip(page); //.sort({[sortField]: sortOrder === 'ASC' ? 1 : -1 });
      
      let total = (await User.find({})).length;//.sort({[sortField]: sortOrder === 'ASC' ? 1 : -1 })).length;
      // console.log("total  ", total)

      return {
        status:true,
        data,
        total,
        executionTime: `Time to execute = ${
          (Date.now() - start) / 1000
        } seconds`
      }
    },
    async getManyUsers(root, {
      _ids
    }) {
      console.log("getManyUsers :", _ids)

      let start = Date.now()

      let data =  await User.find({_id: {
        $in: _ids,
      }})

      return {
        status:true,
        data,
        executionTime: `Time to execute = ${
          (Date.now() - start) / 1000
        } seconds`
      }
    },
    async FindUser(root, {
      filter
    }) {

      let start = Date.now()

      console.log("FindUser filter : ", JSON.parse(JSON.stringify(filter.q)),
                  `Time to execute = ${ (Date.now() - start) / 1000 } seconds` )

      let q = filter.q.split("=")


      let data = await User.find({[q[0]]:q[1]});

      return {
        status:true,
        data,
        executionTime: `Time to execute = ${
          (Date.now() - start) / 1000
        } seconds`
      }
    },
    // user

    // homes
    async homes(parent, args, context, info) {
      let {
        page,
        perPage, 
        keywordSearch, 
        category
      } = args

      let start = Date.now()

      // console.log("Homes: page : ", page,
      //             ", perPage : ", perPage, 
      //             ", keywordSearch : ", keywordSearch,
      //             ", category : ", category , 
      //             `Time to execute = ${
      //               (Date.now() - start) / 1000
      //             } seconds` )

      

      /*
      0 : ชื่อเรื่อง | title
      1 : ชื่อ-นามสกุล บัญชีผู้รับเงินโอน | nameSubname
      2 : เลขบัตรประชาชนคนขาย | idCard
      3 : บัญชีธนาคาร | banks[]
      4 : เบอร์โทรศัพท์ | tels[]
      */

      if(!context.status){
        // foce logout
      }

      let data = null;
      let total = 0;

      let skip =  page == 0 ? page : (perPage * page) + 1;
     
      let p = 0;

      // console.log("keywordSearch ::", !!keywordSearch, keywordSearch)
      if(!!keywordSearch){
        keywordSearch = keywordSearch.trim()
        
        category = category.split(',');

        let regex = [];
        if(category.includes("0")){
          regex = [...regex, {title: { $regex: '.*' + keywordSearch + '.*', $options: 'i' } }]
        }

        if(category.includes("1")){
          regex = [...regex, {nameSubname: { $regex: '.*' + keywordSearch + '.*', $options: 'i' } }]
        }

        if(category.includes("2")){
          regex = [...regex, {idCard: { $regex: '.*' + keywordSearch + '.*', $options: 'i' } }]
        }

        if(category.includes("3")){
          regex = [...regex, {"banks.bankAccountName": { $in: [keywordSearch] } }]
        }

        if(category.includes("4")){
          regex = [...regex, {tels: { $in: [keywordSearch] } }]
        }

        console.log("regex :", regex)

        data = await Post.find({ $or: regex }).limit(perPage).skip(skip);

        p = (Date.now() - start) / 1000;
        total = (await Post.find().lean().exec()).length; 
      }else{
        data = await Post.find().limit(perPage).skip(skip); 

        p = (Date.now() - start) / 1000;
        total = (await Post.find().lean().exec()).length;
      }
      console.log("total , skip :", total, skip)

      let new_data = await Promise.all( _.map(data, async(v)=>{
                        return {...v._doc, shares: await Share.find({postId: v._id})}
                      }))

      return {
        status:true,
        data: new_data,
        total,
        executionTime: `Time to execute = ${
          (Date.now() - start) / 1000
        }-${ p } seconds`,
      }
    },
    // homes

    // post
    async post(parent, args, context, info) {

      if(!context.status){
        // foce logout
      }

      let { _id } = args
      let data = await Post.findById(_id);
      return {
        status:true,
        data
      }
    },
    async posts(root, {
      page,
      perPage
    }) {

      let start = Date.now()

      console.log("Posts: page : ", page,
                  ", perPage : ", perPage, 
                  `Time to execute = ${
                    (Date.now() - start) / 1000
                  } seconds` )

      let data = await  Post.find({}).limit(perPage).skip(page); 
      let total = (await Post.find().lean().exec()).length;

      return {
        status:true,
        data,
        total,
        executionTime: `Time to execute = ${
          (Date.now() - start) / 1000
        } seconds`
      }
    },
    async postsByUser(root, {
      userId
    }) {

      let start = Date.now()

      // console.log("postsByUser : ", userId)
      
      let data = await  Post.find({ownerId: userId}); 
      return {
        status:true,
        data,
        total: data.length,
        executionTime: `Time to execute = ${
          (Date.now() - start) / 1000
        } seconds`
      }
    },
    async getManyPosts(root, {
      _ids
    }) {
      console.log("getManyPosts :", _ids)

      let start = Date.now()
      let data =  await Post.find({_id: {
        $in: _ids,
      }})

      return {
        status:true,
        data,
        executionTime: `Time to execute = ${
          (Date.now() - start) / 1000
        } seconds`
      }
    },
    // post

    // Role
    async Role(root, {
      _id
    }) {

      let data = await Role.findById(_id);
      return {
        status:true,
        data
      }
    },
    async Roles(root, {
      page,
      perPage
    }) {

      let start = Date.now()

      console.log("Roles: page : ", page,
                  ", perPage : ", perPage, 
                  `Time to execute = ${
                    (Date.now() - start) / 1000
                  } seconds` )

      let data = await Role.find();

      return {
        status:true,
        data,
        executionTime: `Time to execute = ${
          (Date.now() - start) / 1000
        } seconds`
      }
    },
    async getManyRoles(root, {
      _ids
    }) {
      console.log("getManyRoles :", _ids)

      let start = Date.now()
      let data =  await Role.find({_id: {
        $in: _ids,
      }})

      return {
        status:true,
        data,
        executionTime: `Time to execute = ${
          (Date.now() - start) / 1000
        } seconds`
      }
    },
    // Role

    // Bank
    async Bank(root, {
      _id
    }) {

      let data = await Bank.findById(_id);
      return {
        status:true,
        data
      }
    },
    async Banks(root, {
      page,
      perPage
    }) {

      let start = Date.now()

      console.log("Banks: page : ", page,
                  ", perPage : ", perPage, 
                  `Time to execute = ${
                    (Date.now() - start) / 1000
                  } seconds` )

      let data = await Bank.find();

      return {
        status:true,
        data,
        executionTime: `Time to execute = ${
          (Date.now() - start) / 1000
        } seconds`
      }
    },
    async getManyBanks(root, {
      _ids
    }) {
      console.log("getManyBanks :", _ids)

      let start = Date.now()


      let data =  await Bank.find({_id: {
        $in: _ids,
      }})

      return {
        status:true,
        data,
        executionTime: `Time to execute = ${
          (Date.now() - start) / 1000
        } seconds`
      }
    },
    // Bank

    // BasicContent
    async basicContent(root, {
      _id
    }) {

      let data = await BasicContent.findById(_id);
      return {
        status:true,
        data
      }
    },
    async basicContents(root, {
      page,
      perPage
    }) {

      let start = Date.now()

      let data = await BasicContent.find();
      
      return {
        status:true,
        data,
        executionTime: `Time to execute = ${
          (Date.now() - start) / 1000
        } seconds`
      }
    },
    // BasicContent

    // Mail
    async Mail(root, {
      _id
    }) {

      let data = await Mail.findById(_id);
      return {
        status:true,
        data
      }
    },
    async Mails(root, {
      page,
      perPage
    }) {

      let start = Date.now()

      console.log("Mails: page : ", page,
                  ", perPage : ", perPage,
                  `Time to execute = ${
                    (Date.now() - start) / 1000
                  } seconds` )

      let data = await Mail.find();

      return {
        status:true,
        data,
        executionTime: `Time to execute = ${
          (Date.now() - start) / 1000
        } seconds`
      }
    },
    async getManyMails(root, {
      _ids
    }) {
      console.log("getManyMails :", _ids)

      let start = Date.now()


      let data =  await Mail.find({_id: {
        $in: _ids,
      }})

      return {
        status:true,
        data,
        executionTime: `Time to execute = ${
          (Date.now() - start) / 1000
        } seconds`
      }
    },
    // Mail

    // Socket
    async Socket(root, {
      _id
    }) {

      console.log("Socket >> ")

      let data = await Socket.findById(_id);
      return {
        status:true,
        data
      }
      
    },
    async Sockets(root, {
      page,
      perPage
    }) {
      let start = Date.now()
      let data = await Socket.find();

      return {
        status:true,
        data,
        executionTime: `Time to execute = ${
          (Date.now() - start) / 1000
        } seconds`
      }
    },
    async getManySockets(root, {
      _ids
    }) {
      console.log("getManySockets :", _ids)

      let start = Date.now()
      let data =  await Socket.find({_id: {
        $in: _ids,
      }})

      return {
        status:true,
        data,
        executionTime: `Time to execute = ${
          (Date.now() - start) / 1000
        } seconds`
      }
    },
    // Socket

    // Comment 
    async comment(root, {
      postId
    }) {
      let start = Date.now()

      // console.log("Comment: ", postId)

      let data = await Comment.findOne({postId: postId});

      // console.log("Comment > data : ", data)
      return {
        status:true,
        data: _.isEmpty(data) ? [] : data.data,
        executionTime: `Time to execute = ${
          (Date.now() - start) / 1000
        } seconds`
      }
    },
    // async Comments(root, {
    //   postId
    // }) {

    //   let start = Date.now()

    //   console.log("Comments, postId : ", postId
    //               `Time to execute = ${
    //                 (Date.now() - start) / 1000
    //               } seconds` )

    //   let data = await  Comment.find({postId: postId});

    //   let total = await  Comment.find({postId: postId});
    //   console.log("total  ", total)

    //   return {
    //     status:true,
    //     data,
    //     total,
    //     executionTime: `Time to execute = ${
    //       (Date.now() - start) / 1000
    //     } seconds`
    //   }
    // },
    async getManyReferenceComment(root, {
      postId,
      page,
      perPage, 
      sortField,
      sortOrder, 
      filter
    }) {

      let start = Date.now()

      console.log("Comments: page : ", page,
                  ", perPage : ", perPage, 
                  ", sortField : ", sortField,
                  ", sortOrder : ", sortOrder, 
                  ", filter : ", JSON.parse(JSON.stringify(filter)),
                  `Time to execute = ${
                    (Date.now() - start) / 1000
                  } seconds` )

      // let data = await Comment.find();

      // let data = await User.find();
      let data = await  Comment.find({postId}).limit(perPage).skip(page).sort({[sortField]: sortOrder === 'ASC' ? 1 : -1 });

      let total = (await Comment.find({postId}).sort({[sortField]: sortOrder === 'ASC' ? 1 : -1 })).length;
      console.log("total  ", total)

      return {
        status:true,
        data,
        total,
        executionTime: `Time to execute = ${
          (Date.now() - start) / 1000
        } seconds`
      }
    },
    // Comment

    async Bookmarks(root, {
      page,
      perPage
    }) {
      let start = Date.now()
      let data = await Bookmark.find();
      return {
        status:true,
        data,
        executionTime: `Time to execute = ${
          (Date.now() - start) / 1000
        } seconds`
      }
    },

    async bookmarksByPostId(root, {
      postId
    }) {
      let start = Date.now()
      let data  = await Bookmark.find({ postId });
      return {
        status:true,
        data,
        executionTime: `Time to execute = ${
          (Date.now() - start) / 1000
        } seconds`
      }
    },

    async isBookmark(root, {
      userId,
      postId
    }) {
      let start = Date.now()
      let data =await Bookmark.findOne({ userId, postId });

      return {
        status:true,
        data,
        executionTime: `Time to execute = ${
          (Date.now() - start) / 1000
        } seconds`
      }
    },

    // 
    async bookmarksByUserId(root, {
      userId
    }) {
      let start = Date.now()
      let data  = await Bookmark.find({ userId, status:true });
      return {
        status:true,
        data,
        executionTime: `Time to execute = ${
          (Date.now() - start) / 1000
        } seconds`
      }
    },

    // isFollow(userId: ID!, friendId: ID!): FollowPayLoad
    async isFollow(root, {
      userId,
      friendId
    }) {
      let start = Date.now()
      let data =await Follow.findOne({ userId, friendId });

      return {
        status:true,
        data,
        executionTime: `Time to execute = ${
          (Date.now() - start) / 1000
        } seconds`
      }
    },

    async follower(root, {
      userId
    }) {

      let start = Date.now()
      let follows =await Follow.find({ friendId: userId, status: true  });

      let data =  await Promise.all(_.map(follows, async(v)=>{ return await User.findById(v.userId) }))

      return {
        status:true,
        data: data,
        total: data.length,
        executionTime: `Time to execute = ${
          (Date.now() - start) / 1000
        } seconds`
      }
    },

    async followingByUserId(root, {
      userId
    }) {
      console.log("followingByUserId : ", userId)
      let start = Date.now()
      let data =await Follow.find({ userId: userId, status: true  });

      console.log("followingByUserId data : ", data)
      return {
        status:true,
        data,
        executionTime: `Time to execute = ${
          (Date.now() - start) / 1000
        } seconds`
      }
    },


    // 
    async ContactUsList(root, {
      page,
      perPage
    }) {
      let start = Date.now()
      let data = await ContactUs.find();
      return {
        status:true,
        data,
        executionTime: `Time to execute = ${
          (Date.now() - start) / 1000
        } seconds`
      }
    },

    /////
    async TContactUs(root, {
      _id
    }) {

      let data = await tContactUs.findById(_id);
      return {
        status:true,
        data
      }
    },
    async TContactUsList(root, {
      page,
      perPage
    }) {

      let start = Date.now()

      console.log("TContactUsList: page : ", page,
                  ", perPage : ", perPage, 
                  `Time to execute = ${
                    (Date.now() - start) / 1000
                  } seconds` )

      let data = await tContactUs.find();

      return {
        status:true,
        data,
        executionTime: `Time to execute = ${
          (Date.now() - start) / 1000
        } seconds`
      }
    },
    async getManyTContactUsList(root, {
      _ids
    }) {
      console.log("getManyTContactUsList :", _ids)

      let start = Date.now()

      let data =  await tContactUs.find({_id: {
        $in: _ids,
      }})

      return {
        status:true,
        data,
        executionTime: `Time to execute = ${
          (Date.now() - start) / 1000
        } seconds`
      }
    },
    /////


    /////
    async Shares(root, {
      page,
      perPage
    }) {

      let start = Date.now()
      console.log("Shares: page : ", page,
                  ", perPage : ", perPage, 
                  `Time to execute = ${
                    (Date.now() - start) / 1000
                  } seconds` )

      let data = await Share.find();

      return {
        status:true,
        data,
        executionTime: `Time to execute = ${
          (Date.now() - start) / 1000
        } seconds`
      }
    },

    async ShareByPostId(root, {
      postId,
      page,
      perPage
    }) {

      let start = Date.now()
      // console.log("ShareByPostId  postId: ", postId,
      //             ", page : ", page, 
      //             ", perPage : ", perPage, 
      //             `Time to execute = ${
      //               (Date.now() - start) / 1000
      //             } seconds` )

      let data = await Share.find({postId: postId});
      return {
        status:true,
        data,
        executionTime: `Time to execute = ${
          (Date.now() - start) / 1000
        } seconds`
      }
    },

    async Dblog(root, {
      page,
      perPage
    }) {

      let start = Date.now()
      console.log("Dblog  : ", page, 
                  ", perPage : ", perPage, 
                  `Time to execute = ${
                    (Date.now() - start) / 1000
                  } seconds` )
            
      let skip =  page == 0 ? page : (perPage * page) + 1;
      let data = await Dblog.find({}).limit(perPage).skip(skip);

      return {
        status:true,
        data,
        executionTime: `Time to execute = ${
          (Date.now() - start) / 1000
        } seconds`
      }
    },

    // 
    async conversations(root, {
      userId
    }) {

      let start = Date.now()

      let data = await Conversation.find({
        members: { $all: [userId] },
      });

      return {
        status:true,
        data,
        executionTime: `Time to execute = ${
          (Date.now() - start) / 1000
        } seconds`
      }
    },

    // 
    async message(root, {
      _id
    }) {

      
      let start = Date.now()

      let data = await Message.find({
        conversationId: _id,
      });

      console.log("message : ", _id, data)

      return {
        status:true,
        data,
        executionTime: `Time to execute = ${
          (Date.now() - start) / 1000
        } seconds`
      }
    },
    
  },
  Mutation: {

    async currentNumber(parent, args, context, info) {
      let currentNumber = Math.floor(Math.random() * 1000);
      pubsub.publish("NUMBER_INCREMENTED", { numberIncremented: currentNumber });
      return currentNumber;
    },

    // Login & Logout
    async login(parent, args, context, info) {

      let {input} = args

      let start = Date.now()
      let user = emailValidate().test(input.username) ?  await User.findOne({email: input.username}) : await User.findOne({username: input.username})

      if(user === null){
        return {
          status: false,
          messages: "xxx", 
          data:{
            _id: "",
            username: "",
            password: "",
            email: "",
            displayName: "",
            roles:[]
          },
          executionTime: `Time to execute = ${
            (Date.now() - start) / 1000
          } seconds`
        }
      }

      // update lastAccess
      await User.findOneAndUpdate({
        _id: user._doc._id
      }, {
        lastAccess : Date.now()
      }, {
        new: true
      })

      let roles = await Promise.all(_.map(user.roles, async(_id)=>{
        let role = await Role.findById(_id)
        return role.name
      }))

      user = { ...user._doc,  roles }
      // console.log("Login : ", user )

      let token = jwt.sign(user._id.toString(), process.env.JWT_SECRET)

      input = {...input, token}
      await Session.create(input);

      return {
        status: true,
        messages: "", 
        token,
        data: user,
        executionTime: `Time to execute = ${
          (Date.now() - start) / 1000
        } seconds`
      }
    },
    // loginWithSocial
    async loginWithSocial(root, {
      input
    }) {
      console.log("loginWithSocial :", input)
      // input = {...input, displayName: input.username}
      // return await User.create(input);

      return {_id: "12222"}
    },
    // user
    async createUser(parent, args, context, info) {
      
      if(_.isEmpty(context)){
        // logger.error(JSON.stringify(args));
        return;
      }

      let {input} = args

      input = {...input, displayName: input.username}
      return await User.create(input);
    },
    async updateUser(root, {
      _id,
      input
    }) {
      console.log("updateUser :", _id)
      return await User.findOneAndUpdate({
        _id
      }, input, {
        new: true
      })
    },
    async deleteUser(root, {
      _id
    }) {
      console.log("deleteUser :", _id)
      return await User.findByIdAndRemove(_id)
    },
    // user

    // post
    
    async createPost(root, {
      input
    }) {
      console.log("createPost")
      return await Post.create(input);
    },

    async updatePost(root, {
      _id,
      input
    }) {
      console.log("updatePost :", _id )
      return await Post.findOneAndUpdate({
        _id
      }, input, {
        new: true
      })
    },

    async deletePost(root, {
      _id
    }) {
      console.log("deletePost :", _id)
      return await Post.findByIdAndRemove({_id})
    },

    // deletePosts
    async deletePosts(root, {
      _ids
    }) {
      
      console.log("deletePosts :",JSON.parse(JSON.stringify(_ids)))

      let deleteMany =  await Post.deleteMany({_id: {
        $in: _ids,
      }})
      return deleteMany;
    },

    // post

    // role     
    async createRole(root, {
      input
    }) {
      console.log("createRole :",JSON.parse(JSON.stringify(input)))

      return await Role.create(JSON.parse(JSON.stringify(input)));
    },
    async updateRole(root, {
      _id,
      input
    }) {
      console.log("updateRole :", _id )
      
      return await Role.findOneAndUpdate({
        _id
      }, input, {
        new: true
      })
    },
    async deleteRole(root, {
      _id
    }) {
      console.log("deleteRole :", _id)

      return await Role.findByIdAndRemove({_id})
    },
    async deleteRoles(root, {
      _ids
    }) {
      console.log("deleteRole :", _ids)

      let deleteMany =  await Role.deleteMany({_id: {
        $in: _ids,
      }})
      return deleteMany;
    },
    // role

    // bank
    async createBank(root, {
      input
    }) {
      console.log("createBank :",JSON.parse(JSON.stringify(input)))

      return await Bank.create(JSON.parse(JSON.stringify(input)));
    },
    async updateBank(root, {
      _id,
      input
    }) {
      console.log("updateBank :", _id, JSON.parse(JSON.stringify(input)))
      
      return await Bank.findOneAndUpdate({
        _id
      }, input, {
        new: true
      })
    },
    async deleteBank(root, {
      _id
    }) {
      console.log("deleteBank :", _id)

      return await Bank.findByIdAndRemove({_id})
    },
    async deleteBanks(root, {
      _ids
    }) {
      console.log("deleteBanks :", _ids)

      let deleteMany =  await Bank.deleteMany({_id: {
        $in: _ids,
      }})
      return deleteMany;
    },
    // bank


   // basic content

    async createBasicContent(root, {
      input
    }) {
      console.log("CreateBasicContent :",JSON.parse(JSON.stringify(input)))

      return await BasicContent.create(JSON.parse(JSON.stringify(input)));
    },
    async updateBasicContent(root, {
      _id,
      input
    }) {
      console.log("UpdateBasicContent :", _id, JSON.parse(JSON.stringify(input)))
      
      return await BasicContent.findOneAndUpdate({
        _id
      }, input, {
        new: true
      })
    },

   // basic content

    // mail
    async createMail(root, {
      input
    }) {
      console.log("createMail :",JSON.parse(JSON.stringify(input)))

      return await Mail.create(JSON.parse(JSON.stringify(input)));
    },
    async updateMail(root, {
      _id,
      input
    }) {
      console.log("updateMail :", _id, JSON.parse(JSON.stringify(input)))
      
      return await Mail.findOneAndUpdate({
        _id
      }, input, {
        new: true
      })
    },
    async deleteMail(root, {
      _id
    }) {
      console.log("deleteMail :", _id)

      return await Mail.findByIdAndRemove({_id})
    },
    async deleteMails(root, {
      _ids
    }) {
      console.log("deleteMails :", _ids)

      let deleteMany =  await Mail.deleteMany({_id: {
        $in: _ids,
      }})
      return deleteMany;
    },


    // mail

    // comment
    async createComment(root, {
      input
    }) {

      /*
      console.log("createComment :", input.postId)

      let result = await Comment.findOneAndUpdate({
        postId: input.postId
      }, input, {
        new: true
      })
     
      if(result === null){
        result = await Comment.create(input);
      }

      console.log("createComment result :", result)

      return result
      */

      let start = Date.now()

      let result = await Comment.findOneAndUpdate({
        postId: input.postId
      }, input, {
        new: true
      })
      
      if(result === null){
        result = await Comment.create(input);
      }

      console.log("createComment : ", result)
                  
      return {
        status:true,
        data: result.data,
        executionTime: `Time to execute = ${
          (Date.now() - start) / 1000
        } seconds`
      }
    },

    async updateComment(root, {
      _id,
      input
    }) {
      console.log("updateComment :", _id, JSON.parse(JSON.stringify(input)))
      
      return await Comment.findOneAndUpdate({
        _id
      }, input, {
        new: true
      })
    },

    async deleteComment(root, {
      _id
    }) {
      console.log("deleteComment :", _id)

      return await Comment.findByIdAndRemove({_id})
    },
    async deleteComment(root, {
      _ids
    }) {
      console.log("deleteComment :", _ids)

      let deleteMany =  await Comment.deleteMany({_id: {
        $in: _ids,
      }})
      return deleteMany;
    },
    // comment
    
    async createAndUpdateBookmark(parent, args, context, info) {

      if(_.isEmpty(context)){
        // logger.error(JSON.stringify(args));
        return;
      }

      let {input} = args

      /**
       * validate data
      */
      if(_.isEmpty(await Post.findById(input.postId))){
        // logger.error("Post id empty :", input.postId)
        return;
      } 

      if(_.isEmpty(await User.findById(input.userId))){
        // logger.error("User id empty :", input.userId)
        return;
      } 
      /**
       * validate data
      */

      let result = await Bookmark.findOneAndUpdate({
        postId: input.postId
      }, input, {
        new: true
      })
     
      if(result === null){
        result = await Bookmark.create(input);
      }

      return result;
    },
    async createAndUpdateFollow(parent, args, context, info) {

      if(_.isEmpty(context)){
        // logger.error(JSON.stringify(args));
        return;
      }
      
      let {input} = args

      /**
       * validate data
      */
      if(_.isEmpty(await User.findById(input.userId))){
        // logger.error("User id empty :", input.userId)
        return;
      } 

      if(_.isEmpty(await User.findById(input.friendId))){
        // logger.error("User id empty :", input.friendId)
        return;
      } 
      /**
       * validate data
      */

      let result = await Follow.findOneAndUpdate({
        userId: input.userId, friendId: input.friendId
      }, input, {
        new: true
      })
     
      if(result === null){
        result = await Follow.create(input);
      }

      return result;
    },
    // TContactUs
    async createTContactUs(root, {
      input
    }) {
      console.log("createTContactUs")

      return await tContactUs.create(input);
    },
    async updateTContactUs(root, {
      _id,
      input
    }) {
      console.log("updateTContactUs :", _id )
      
      return await tContactUs.findOneAndUpdate({
        _id
      }, input, {
        new: true
      })
    },
    async deleteTContactUs(root, {
      _id
    }) {
      console.log("deleteTContactUs :", _id)

      return await tContactUs.findByIdAndRemove({_id})
    },
    async deleteTContactUsList(root, {
      _ids
    }) {
      console.log("deleteTContactUsList :", _ids)
      return await tContactUs.deleteMany({_id: {
        $in: _ids,
      }})
    },
    // TContactUs

    async createContactUs(parent, args, context, info) {

      if(_.isEmpty(context)){
        // logger.error(JSON.stringify(args));
        return;
      }

      let {input} = args

      /**
       * validate data
      */
      if(_.isEmpty(await Post.findById(input.postId))){
        // logger.error("Post id empty : ", input.postId)
        return;
      } 

      if(_.isEmpty(await User.findById(input.userId))){
        // logger.error("User id empty : ", input.userId)
        return;
      } 
      /**
       * validate data
      */

      return await ContactUs.create(input);
    },

    async createShare(root, {
      input
    }) {
      console.log("createShare")

      return await Share.create(input);
    },

    async createConversation(root, {
      input
    }) {
      console.log("createConversation params : ", input)

      let result= await Conversation.findOne({
        members: { $all: [input.userId, input.friendId] },
      });

      if(result === null){
        result = await Conversation.create({
          members: [input.userId, input.friendId],
        });
      }

      console.log("createConversation result : ", result)

      return result;
    },

    // 
    async addMessage(root, {
      input
    }) {
      console.log("addMessage params : ", input)

      // let result= await Conversation.findOne({
      //   members: { $all: [input.userId, input.friendId] },
      // });

      // if(result === null){
      //   result = await Message.create({
      //     members: [input.userId, input.friendId],
      //   });
      // }

      // console.log("createConversation result : ", result)

      let result = await Message.create(input);

      return result;
    },
  },

  Subscription:{
    numberIncremented: {
      resolve: (payload) => 122,
      subscribe: () => pubsub.asyncIterator(["NUMBER_INCREMENTED"]),
    },

    // commentAdded: {
    //   subscribe: () => pubsub.asyncIterator(["NUMBER_INCREMENTED"]),
    // },

  }

  // commentAdded
};