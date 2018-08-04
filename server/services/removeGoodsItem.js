const mongoose = require('mongoose')
const Goods = mongoose.model('goods')

const removeGoodsItem = async (goodsId) => {
  const goods = await Goods.findOne({ _id: goodsId })

  if (!goods) return false

  await goods.remove()

  return true
}

module.exports = removeGoodsItem