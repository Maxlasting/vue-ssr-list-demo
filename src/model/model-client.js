import axios from 'axios'

const request = axios.create({
  baseURL: '/api'
})

const handleRequest = (request) => new Promise(async (resolve, reject) => (
  request.then((res) => resolve(res.data)).catch((err) => {
    const res = err.response
    if (res.status === 401) {
      reject('Need auth!')
    }
  })
))

const userLogin = (username, password) => handleRequest(request.post('/login', { username, password }))

const userLogout = () => handleRequest(request.get('/logout'))

const getGoodsList = (user) => handleRequest(request.get('/list/' + user))

const addOneGoods = (user, name, price) => handleRequest(request.post('/add/' + user, { name, price }))

const removeOneGoods = (goodsId) => handleRequest(request.delete('/remove/' + goodsId))

const updateOneGoods = (goodsId, name, price) => handleRequest(request.put('/update/' + goodsId, { name, price }))

export default { userLogin, userLogout, getGoodsList, addOneGoods, removeOneGoods, updateOneGoods }