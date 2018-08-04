const mongoose = require('mongoose')
const Goods = mongoose.model('goods')

const updateGoodsItem = async (goodsId, name, price) => {
  let goods = await Goods.findById(goodsId, { __v: 0, user: 0 })

  if (!goods) return null

  goods.name = name ? name : goods.name
  goods.price = price ? price : goods.price

  try {
    await goods.save()
    return goods
  } catch (err) {
    return null
  }
}

module.exports = updateGoodsItem