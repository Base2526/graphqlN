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
        Dblog} from './model'
import {emailValidate} from './utils'

const _ = require("lodash");

export default {
  Query: {

    // Login & Logout
    async Login(root, {
      username, 
      password
    }) {
      let start = Date.now()

     

      // let user = null;
      // if(emailValidate().test(username)){
      //   user = await User.findOne({email: username})
      // }else{
      //   user = await User.findOne({username})
      // }

      let user = emailValidate().test(username) ?  await User.findOne({email: username}) : await User.findOne({username})

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
        lastAccess: Date.now()
      }, {
        new: true
      })

      user = emailValidate().test(username) ?  await User.findOne({email: username}) : await User.findOne({username})

      let roles = await Promise.all(_.map(user.roles, async(_id)=>{
        let role = await Role.findById(_id)
        console.log("_id", _id, role)
        return role.name
      }))
      user = {...user._doc,  roles}

      console.log("Login vvv", user )

      return {
        status: true,
        messages: "", 
        data: user,
        executionTime: `Time to execute = ${
          (Date.now() - start) / 1000
        } seconds`
      }
    },
    // Login & Logout

    // user
    async User(root, {
      _id
    }) {
      let start = Date.now()

      console.log("User : >> ", _id)
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

      console.log("users: page : ", page,
                  ", perPage : ", perPage,
                  `Time to execute = ${
                    (Date.now() - start) / 1000
                  } seconds` )

      // let data = await User.find();
      let data = await  User.find({}).limit(perPage).skip(page); //.sort({[sortField]: sortOrder === 'ASC' ? 1 : -1 });
      
      let total = (await User.find({})).length;//.sort({[sortField]: sortOrder === 'ASC' ? 1 : -1 })).length;
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
    async Homes(root, {
      page,
      perPage, 
      keywordSearch, 
      category
    }) {

      let start = Date.now()

      console.log("Homes: page : ", page,
                  ", perPage : ", perPage, 
                  ", keywordSearch : ", keywordSearch,
                  ", category : ", category, 
                  `Time to execute = ${
                    (Date.now() - start) / 1000
                  } seconds` )


      let data = await  Post.find({}).limit(perPage).skip(page); //.sort({[sortField]: sortOrder === 'ASC' ? 1 : -1 });
      
      let total = (await Post.find({})).length; //.sort({[sortField]: sortOrder === 'ASC' ? 1 : -1 })).length;
      console.log("total  ", total)

      // let data = await Post.find();

      return {
        status:true,
        data,
        total,
        executionTime: `Time to execute = ${
          (Date.now() - start) / 1000
        } seconds`
      }
    },
    // homes

    // post
    async Post(root, {
      _id
    }) {

      
      let data = await Post.findById(_id);

      // console.log("Post: ", data)
      return {
        status:true,
        data
      }
    },
    async Posts(root, {
      page,
      perPage
    }) {

      let start = Date.now()

      console.log("Posts: page : ", page,
                  ", perPage : ", perPage, 
                  `Time to execute = ${
                    (Date.now() - start) / 1000
                  } seconds` )


      let data = await  Post.find({}).limit(perPage).skip(page); //.sort({[sortField]: sortOrder === 'ASC' ? 1 : -1 });
      
      let total = (await Post.find({})).length; //.sort({[sortField]: sortOrder === 'ASC' ? 1 : -1 })).length;
      console.log("total  ", total)

      // let data = await Post.find();

      return {
        status:true,
        data,
        total,
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
    async Comment(root, {
      postId
    }) {
      let start = Date.now()

      let data = await Comment.find({postId: postId});
      return {
        status:true,
        data,
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

    async BookmarksByPostId(root, {
      postId,
      page,
      perPage
    }) {
      console.log("BookmarksByPostId : ", postId, page, perPage)
      let start = Date.now()
      let data = await Bookmark.find({postId: postId});
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
      console.log("ShareByPostId  postId: ", postId,
                  ", page : ", page, 
                  ", perPage : ", perPage, 
                  `Time to execute = ${
                    (Date.now() - start) / 1000
                  } seconds` )

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

      let data = await Dblog.find();
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
    // user
    async createUser(root, {
      input
    }) {
      console.log("createUser :", input)
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
      // console.log("createComment :", input.postId)

      return await Comment.create(input);

      // return await Comment.findOneAndUpdate({
      //   postId: input.postId
      // }, input, {
      //   new: true
      // })
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


    async createBookmark(root, {
      input
    }) {
      console.log("createBookmark :")

      return await Bookmark.create(input);
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

    async createContactUs(root, {
      input
    }) {
      console.log("createContactUs")

      return await ContactUs.create(input);
    },

    async createShare(root, {
      input
    }) {
      console.log("createShare")

      return await Share.create(input);
    },
  }
};