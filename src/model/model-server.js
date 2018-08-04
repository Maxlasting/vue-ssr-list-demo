const getAllGoods = require('../../server/services/getAllGoods.js')

export default { 
  getGoodsList (user) {
    return new Promise(async (resolve, reject) => {
      try {
        const ret = await getAllGoods(user)
        resolve({
          success: true,
          msg: '',
          data: ret
        })
      } catch (error) {
        reject({
          success: false,
          msg: 'Server model error!',
          data: []
        })
      }
    })
  }
}