const { exec } = require('../db/mysql')

const getList = (author, keyword) => {
    let sql = `select * from blogs where 1=1 `
    if (author) {
        sql += `and author = '${author}' `
    }
    if (keyword) {
        sql += `and title like '%${keyword}' `
    }
    sql += `order by createtime desc;`

    //返回的 promise
    return exec(sql)

    // //返回假数据(格式是正确的)
    // return [
    //     {
    //         id: 1,
    //         title: '标题1',
    //         content: '内容A',
    //         createTime: 1576903657944,
    //         author: 'yangsg'
    //     },
    //     {
    //         id: 2,
    //         title: '标题2',
    //         content: '内容B',
    //         createTime: 1576903741059,
    //         author: 'gsg'
    //     }
    // ]
}

const getDetail = (id) => {
    const sql = `select * from blogs where id='${id}'`
    return exec(sql).then(row => {
        return row[0]
    })

    // return[
    //     {
    //         id:1,
    //         title:'博客内容',
    //         content:'内容B',
    //         createTime:1576903741059,
    //         author: '66sg' 
    //     }
    // ]
}

const newBlog = (blogData = {}) => {
    //blogData 是一个博客对象  包括title content 属性
    const title = blogData.title
    const content = blogData.content
    const author = blogData.author
    const createTime = Date.now()
    const sql = `
          insert into blogs(title, content, createtime, author)
          values ('${title}','${content}','${createTime}','${author}')
    `

    return exec(sql).then(inserData => {
        // console.log('insertData is',inserData)
        return {
            id: inserData.insertId
        }
    })


    // console.log('newblog blogdata....', blogData)
    return {
        id: 3 //表示新建博客，插入到数据表的id
    }

}


const updateBlog = (id, blogData = {}) => {
    // 就是要更新博客的 id
    // blogData 是一个博客对象,包括 title content 属性

    const title = blogData.title
    const content = blogData.content

    const sql = `
          update blogs set title='${title}',content='${content}' where id=${id}
    `

    return exec(sql).then(updateData => {
            // console.log('updateData is', updateData)
            if (updateData.affectedRows > 0) {
                return true
            }
            return false
        })
        // console.log("uddate blog", id, blogData)
    return true
}

const delBlog = (id, author) => {
    //id 就是要删除博客的id
    const sql = `delete from blogs where id='${id}' and author='${author}';`
    return exec(sql).then(delData => {
        if (delData.affectedRows > 0) {
            return true
        }
        return false
    })

}

module.exports = {
    getList,
    getDetail,
    newBlog,
    updateBlog,
    delBlog
}