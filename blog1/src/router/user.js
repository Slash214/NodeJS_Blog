const { login } = require('../controller/user')
const { SuccessModel, ErrorModel } = require('../model/resModel')
const {get, set } = require('../db/redis')

const handleUserRouter = (req, res) => {
    const method = req.method //GET  POST
        //登录
    if (method === 'GET' && req.path === '/api/user/login') {
        // const { username, password } = req.body
        const { username, password } = req.query
        const result = login(username, password)
        return result.then(data => {
            if (data.username) {
                //设置 session
                req.session.username = data.username
                req.session.realname = data.realname
                console.log(data.username)
                    //同步到redis
                set(req.sessionId, req.session)
                    // //操作cookie
                    // res.setHeader('Set-Cookie', `username=${username}; path =/; httpOnly; expires=${getCookieExpires()}`)
                    // console.log("这是res.session", req.session)
                return new SuccessModel()
            }
            console.log(data.username)
            return new ErrorModel('登录失败')

        })

    }

    //登录验证测试
    // if (method === 'GET' && req.path === '/api/user/login-test') {  
    //      console.log(req.session)
    //      if (req.session.username) {
    //         return Promise.resolve(
    //             new SuccessModel({
    //                 session: req.session,
    //                 // username:req.session.username

    //             })
    //         ) 
    //     }
    //     return Promise.resolve(
    //         new ErrorModel("未登录")
    //     )
    // }

}

module.exports = handleUserRouter