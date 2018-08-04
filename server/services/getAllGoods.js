const mongoose = require('mongoose')
const Goods = mongoose.model('goods')

const getAllGoods = async (user) => {
  const list = await Goods.find({ user }, { __v: 0, user: 0 }).sort({_id: -1}).exec()

  const data = []

  if (!list.length) return data

  for (let i=0; i<list.length; i++) {
    const { name, price, _id } = list[i]

    data.push({
      name,
      price,
      goodsId: _id
    })
  }

  return data
}

module.exports = getAllGoods