import { gql } from "apollo-server";

export default gql`
  scalar DATETIME
  scalar Long
  scalar Date
  
  type Room {
    _id: ID
    name: String
    summary: String
    description: String
    roomType: String
    maximum_nights: Int
    minimum_nights: Int
    beds: Int
    accommodates: Int
    price: Float
    cleaningFee: Float
  }

  type User {
    _id: ID!
    username: String!
    password: String
    email: String
    displayName: String!
    isActive: String
    roles: [String]!
    image: [File]
    lastAccess: DATETIME
  }

  input UserInput {
    username: String!
    password: String!
    email: String!
    roles: [String]
    isActive: String!
    image: [FileInput]
  }

  type RoomPayLoad {
    status:Boolean
    data:Room
  }
  
  type RoomsPayLoad {
    status:Boolean
    data:[Room]
  }

  type UserPayLoad {
    status:Boolean
    messages:String
    executionTime:String
    data:User
  }

  type UsersPayLoad {
    status:Boolean
    executionTime:String
    data:[User]
    total: Int
  }

  type File {
    _id: ID!
    base64: String
    fileName: String
    lastModified: DATETIME
    size: Int
    type: String
  }

  type PostBank {
    _id: ID!
    bankAccountName: String
    bankId: String
  }

  type PostBankBank {
    _id: ID
    name: String!
    description: String
    isPublish: Int
  }
  
  type Post {
    _id: ID!
    title: String!
    nameSubname: String!
    idCard: Long
    amount: Int
    dateTranfer: DATETIME
    description: String!
    tels: [String]
    banks: [PostBank]
    follows: [ID]
    files: [File]
    isPublish: Int
    ownerId: ID
    createdAt : DATETIME
    updatedAt: DATETIME
  }

  type Role {
    _id: ID
    name: String
    description: String
    isPublish: Int
  }

  type Bank {
    _id: ID!
    name: String!
    description: String
  }

  type TContactUs {
    _id: ID!
    name: String!
    description: String
  }

  type Share {
    _id: ID!
    userId: ID!
    postId: ID!
    destination: String
  }

  type Dblog {
    _id: ID!
    level: String
    meta: String
    message: String
    timestamp: String
  }

  type Mail {
    _id: ID!
    name: String!
    description: String
    isPublish: Int
  }

  type Socket {
    _id: ID!
    socketId: String!
    description: String
  }

  type Comment{
    status: Boolean
    executionTime: String
    data: [CommentParent]
  }

  type CommentData{
    _id: ID!
    postId: ID!
    data: [CommentParent]
  }

  type Bookmark{
    _id: ID
    userId: ID
    postId: ID
    status: Boolean
  }

  type Share{
    _id: ID!
    userId: ID!
    postId: ID!
    destination: String
  }

  type ContactUs {
    _id: ID!
    postId: String!
    categoryId: String!
    userId: String!
    description: String
  }

  type PostPayLoad {
    status:Boolean
    executionTime:String
    data:Post
  }
  
  type PostsPayLoad {
    status:Boolean
    executionTime:String
    data:[Post]
    total: Int
  }

  type RolePayLoad {
    status:Boolean
    executionTime:String
    data:Role
  }

  type RolesPayLoad {
    status:Boolean
    executionTime:String
    data:[Role]
  }

  type BankPayLoad {
    status:Boolean
    executionTime:String
    data:Bank
  }

  type BanksPayLoad {
    status:Boolean
    executionTime:String
    data:[Bank]
  }

  type TContactUsPayLoad {
    status:Boolean
    executionTime:String
    data:TContactUs
  }

  type TContactUsListPayLoad {
    status:Boolean
    executionTime:String
    data:[TContactUs]
  }

  type MailPayLoad {
    status:Boolean
    executionTime:String
    data:Mail
  }

  type MailsPayLoad {
    status:Boolean
    executionTime:String
    data:[Mail]
  }

  type SocketPayLoad {
    status:Boolean
    executionTime:String
    data:Socket
  }

  type SocketsPayLoad {
    status:Boolean
    executionTime:String
    data:[Socket]
  }

  type CommentPayLoad{
    status:Boolean
    executionTime:String
    data:[CommentParent]
  }

  type CommentParent {
    userId: String
    comId: String
    fullName: String
    avatarUrl: String
    text: String
    replies: [Replies]
  }

  type Replies {
    userId: String
    comId: String
    fullName: String
    avatarUrl: String
    text: String
  }

  type CommentsPayLoad{
    status:Boolean
    executionTime:String
    data:[Comment]
    total: Int
  }

  type BookmarksPayLoad{
    status:Boolean
    executionTime:String
    data:[Bookmark]
  }

  type BookmarkPayLoad{
    status:Boolean
    executionTime:String
    data:Bookmark
  }

  type SharesPayLoad{
    status:Boolean
    executionTime:String
    data:[Share]
  }

  type DblogPayLoad{
    status:Boolean
    executionTime:String
    data:[Dblog]
  }

  type ContactUsListPayLoad{
    status:Boolean
    executionTime:String
    data:[ContactUs]
  }

  type Query {

    Homes(page: Int, perPage: Int, keywordSearch: String, category: String ): PostsPayLoad

    Login(username: String!, password: String!): UserPayLoad

    room(_id: ID!): RoomPayLoad
    rooms: RoomsPayLoad

    User(_id: ID!): UserPayLoad
    Users(page: Int, perPage: Int): UsersPayLoad
    getManyUsers(_ids: [ID!]!): UsersPayLoad
    FindUser(filter: PostFilter): UsersPayLoad

    Role(_id: ID!): RolePayLoad
    Roles(page: Int, perPage: Int): RolesPayLoad
    getManyRoles(_ids: [ID!]!): RolesPayLoad

    Bank(_id: ID!): BankPayLoad
    Banks(page: Int, perPage: Int): BanksPayLoad
    getManyBanks(_ids: [ID!]!): BanksPayLoad

    Mail(_id: ID!): MailPayLoad
    Mails(page: Int, perPage: Int ): MailsPayLoad
    getManyMails(_ids: [ID!]!): MailsPayLoad

    Socket(_id: ID!): SocketPayLoad
    Sockets(page: Int, perPage: Int): SocketsPayLoad
    getManySockets(_ids: [ID!]!): SocketsPayLoad

    Post(_id: ID!): PostPayLoad
    Posts(page: Int, perPage: Int ): PostsPayLoad
    _allPostsMeta(page: Int, perPage: Int, sortField: String, sortOrder: String, filter: PostFilter): ListMetadata
    getManyPosts(_ids: [ID!]!): PostsPayLoad
  
    
    Comment(postId: ID!): CommentPayLoad
    getManyReferenceComment(postId: String, page: Int, perPage: Int, sortField: String, sortOrder: String, filter: PostFilter): CommentsPayLoad
  

    Bookmarks(page: Int, perPage: Int): BookmarksPayLoad
    bookmarksByPostId( postId: ID! ): BookmarksPayLoad
    isBookmark(userId: ID!, postId: ID!): BookmarkPayLoad

    ContactUsList(page: Int, perPage: Int): ContactUsListPayLoad

    TContactUs(_id: ID!): TContactUsPayLoad
    TContactUsList(page: Int, perPage: Int): TContactUsListPayLoad
    getManyTContactUsList(_ids: [ID!]!): TContactUsListPayLoad


    Shares(page: Int, perPage: Int): SharesPayLoad
    ShareByPostId(postId: ID!, page: Int, perPage: Int): SharesPayLoad


    Dblog(page: Int, perPage: Int): DblogPayLoad
  }  
  
  input RoomInput {
    name: String
    summary: String
    description: String
    room_type: String
    maximum_nights: Int
    minimum_nights: Int
    beds: Int
    accommodates: Int
    price: Float
    cleaningFee: Float
  }

  input PostInput {
    title: String!
    nameSubname: String!
    idCard: String
    amount: Long!
    dateTranfer: DATETIME
    description: String
    banks: [PostBankInput]
    tels: [String]
    files: [FileInput]
    follows: [ID]
    isPublish: Int
    ownerId: ID
  }

  input PostBankInput {
    bankAccountName: String
    bankId: String
  }

  input RoleInput {
    name: String!
    description: String
    isPublish: Int
  }

  input BInput {
    id: ID
    name: String!
    description: String
    isPublish: Int
  }

  input MailInput {
    name: String!
    description: String
    isPublish: Int
  }

  input BankInput {
    name: String!
    description: String
  }

  input ContactUsInput{
    postId: String!
    categoryId: String!
    userId: ID!
    description: String
  }

  input TContactUsInput {
    name: String!
    description: String
  }

  input ShareInput {
    userId: ID!
    postId: ID!
    destination: String
  }

  input FileInput {
    base64: String
    fileName: String
    lastModified: DATETIME
    size: Int
    type: String
  }

  input CommentInput {
    postId: ID!
    data: [CommentParentInput]
  }

  input CommentParentInput {
    userId: String
    comId: String
    fullName: String
    avatarUrl: String
    text: String
    replies: [RepliesInput]
  }

  input RepliesInput {
    userId: String
    comId: String
    fullName: String
    avatarUrl: String
    text: String
  }

  input BookmarkInput {
    postId: ID!
    userId: ID!
    status: Boolean
  }

  type Mutation {
    # createRoom(input: RoomInput): Room
    # updateRoom(_id: ID!, input: RoomInput): Room
    # deleteRoom(_id: ID!): Room

    createUser(input: UserInput): User
    updateUser(_id: ID!, input: UserInput): User
    deleteUser(_id: ID!): User

    createPost(input: PostInput): Post
    updatePost(_id: ID!, input: PostInput): Post
    deletePost(_id: ID!): Post
    deletePosts(_ids: [ID!]!): deleteType

    createRole(input: RoleInput): Role
    updateRole(_id: ID!, input: RoleInput): Role
    deleteRole(_id: ID!): Role
    deleteRoles(_ids: [ID!]!): deleteType

    createBank(input: BankInput): Bank
    updateBank(_id: ID!, input: BankInput): Bank
    deleteBank(_id: ID!): Bank
    deleteBanks(_ids: [ID!]!): deleteType

    createMail(input: MailInput): Mail
    updateMail(_id: ID!, input: MailInput): Mail
    deleteMail(_id: ID!): Mail
    deleteMails(_ids: [ID!]!): deleteType

    createComment(input: CommentInput): Comment
    updateComment(_id: ID!, input: CommentInput): Comment
    deleteComment(_id: ID!): Comment
    deleteComments(_ids: [ID!]!): deleteType


    createBookmark(input: BookmarkInput): Bookmark

    createContactUs(input: ContactUsInput): ContactUs


    createTContactUs(input: TContactUsInput): TContactUs
    updateTContactUs(_id: ID!, input: TContactUsInput): TContactUs
    deleteTContactUs(_id: ID!): TContactUs
    deleteTContactUsList(_ids: [ID!]!): deleteType

    createShare(input: ShareInput): Share
  }

  type deleteType {
    ok: Int
  }

  input PostFilter {
    q: String
  }

  type ListMetadata {
    count: Int!
  }
`;
