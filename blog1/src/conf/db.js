const env = process.env.NODE_ENV   //环境变量

//配置
let MYSQL_CONF
let REDIS_CONF

//dev 与 production分别是不同的环境变量 如本地或者服务器上
//host 表示地址

if (env === 'dev') {
    MYSQL_CONF = {
        host: 'localhost',
        user: 'root',
        password: '123456',
        database: 'myblog',
        port: '3306'
    }

    //redis
    REDIS_CONF = {
        port: 6379,
        host: '127.0.0.1'
    }
}

if (env === 'production') {
    MYSQL_CONF = {
        host: 'localhost',
        user: 'root',
        password: '123456',
        database: 'myblog',
        port: '3306'
    }

    //redis
    REDIS_CONF = {
        port: 6379,
        host: '127.0.0.1'
    }
}

module.exports = {
    MYSQL_CONF,
    REDIS_CONF
}