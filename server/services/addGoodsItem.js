const mongoose = require('mongoose')
const Goods = mongoose.model('goods')

const addGoodsItem = async (user, name, price) => {
  let goods = await Goods.findOne({ name })

  if (goods) return false

  goods = new Goods({ name, price, user })
  
  await goods.save()

  return goods
}

module.exports = addGoodsItem