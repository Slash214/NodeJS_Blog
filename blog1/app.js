const querystring = require('querystring')
const { get, set } = require('./src/db/redis')
const handleUserRouter = require('./src/router/user')
const hancleBlogRouter = require('./src/router/blog')

//获取cookie 过期时间
const getCookieExpires = () => {
    const d = new Date()
    d.setTime(d.getTime() + (24 * 60 * 60 * 1000))
    console.log('d.toGMTsTRINM()', d.toGMTString())
    return d.toGMTString()
}

//session 数据
// const SESSION_DATA = {}

//用于处理 post data
const getPostData = (req) => {
    const promise = new Promise((resolve, reject) => {
        // if (req.mothod !== 'POST') {
        //     console.log("req。mothhod...." + req.mothod)
        //     resolve({})
        //     return
        // }
        if (req.headers['content-type'] !== 'application/json') {
            resolve({})
            return
        }

        let postData = ''
        req.on('data', chunk => {
            postData += chunk.toString()
        })
        req.on('end', () => {
            if (!postData) {
                resolve({})
                return
            }
            resolve(
                JSON.parse(postData)
            )
        })


    })
    return promise
}


const serverHandle = (req, res) => {
    //设置返回格式JSON 
    res.setHeader('content-type', 'application/json')

    //获取path
    const url = req.url
    req.path = url.split('?')[0]

    //解析query
    req.query = querystring.parse(url.split('?')[1])


    //解析cookie
    req.cookie = {}
    const cookieStr = req.headers.cookie || '' //
    cookieStr.split(';').forEach(item => {
        if (!item) {
            return
        }
        const arr = item.split('=')
        const key = arr[0].trim()
        const val = arr[1].trim()
        req.cookie[key] = val
    })
    // console.log('req.cookie', req.cookie)


    // //解析session.
    // let needSetCookie = false
    // let userId = req.cookie.userid 
    // if(userId) {
    //     if (!SESSION_DATA[userId]) {
    //         SESSION_DATA[userId] = {}
    //     }
    // }else{
    //     needSetCookie = true
    //     userId = `${Date.now()}_${Math.random()}`
    //     SESSION_DATA[userId] = {}
    // }
    // req.session = SESSION_DATA[userId]


    //解析Session （使用Redis）
    let needSetCookie = false
    let userId = req.cookie.userid
    if (!userId) {
        needSetCookie = true
        userId = `${Date.now()}_${Math.random()}`
        //初始化 session
        set(userId, {})
    }
    //获取session 
    req.sessionId = userId
    get(req.sessionId).then(sessionData => {
        if (sessionData == null) {
            //初始化 redis 中的 session 值
            set(req.sessionId, {})
            //设置session
            req.session = {}
        } else {
            //设置session
            req.session = sessionData
        }
        console.log("req.session是", req.session)

        //处理 post data
        return getPostData(req)
    })
        .then(postData => {
            req.body = postData

            //处理blog路由
            // const blogData = hancleBlogRouter(req, res)
            // if (blogData) {
            //     res.end(
            //         JSON.stringify(blogData)
            //     )
            //     return
            // }
            const blogResult = hancleBlogRouter(req, res)
            if (blogResult) {
                blogResult.then(blogData => {
                    if (needSetCookie) {
                        res.setHeader('Set-Cookie', `userid=${userId}; path = /; httpOnly; expires=${getCookieExpires()}`)
                    }

                    res.end(
                        JSON.stringify(blogData)
                    )
                })
                return
            }

            //处理 user 路由
            // const userData = handleUserRouter(req, res)
            // if (userData) {
            //     res.end(
            //         JSON.stringify(userData)
            //     )
            //     return
            // }
            const userResult = handleUserRouter(req, res)
            if (userResult) {
                userResult.then(userData => {
                    if (needSetCookie) {
                        res.setHeader('Set-Cookie', `userid=${userId}; path = /; httpOnly; expires=${getCookieExpires()}`)
                    }

                    res.end(
                        JSON.stringify(userData)
                    )
                })
                return
            }


            //未命中路 返回404
            res.writeHead(404, { 'Content-type': 'text/plain' })
            res.write('404 not Found\n')
            res.end()
        })



}

module.exports = serverHandle