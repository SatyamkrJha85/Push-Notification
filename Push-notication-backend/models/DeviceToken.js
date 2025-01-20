const mongoose = require("mongoose");

const DeviceTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",  // Assuming you have a User model in your app
    required: true,
  },
  deviceToken: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("DeviceToken", DeviceTokenSchema);
