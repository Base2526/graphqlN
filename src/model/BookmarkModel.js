const mongoose = require("mongoose");

const BookmarkModel = new mongoose.Schema(
  {
    userId: { type: String },
    postId: { type: String },
  },
  {
    timestamps: true,
  }
);

const Bookmark = mongoose.model("bookmark", BookmarkModel, "bookmark");
export default Bookmark

