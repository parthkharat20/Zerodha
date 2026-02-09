const mongoose = require("mongoose");
const { HoldingSchema } = require("../schemas/HoldingSchema");

const HoldingsModel = mongoose.model("Holding", HoldingSchema);

module.exports = HoldingsModel;
