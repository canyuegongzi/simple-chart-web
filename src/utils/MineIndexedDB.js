const Dexie = require('../assets/js/dexie.min.js')
export class MineIndexedDB {
    constructor(props) {
        this.props = props
        this._database = null
        this.init()
    }

    /**
     * 数据库初始化
     */
    init() {
        const { tableBaseName } = this.props
        try {
            this._database = new Dexie(tableBaseName)
            this.creatDatabase();
        }catch (e) {
            console.log(e)
            throw new Error('must have one _databaseName')
        }

    }

    /**
     * 创建表
     * @returns {null}
     */
    creatDatabase() {
        const { sqlObj, version } = this.props
        if (sqlObj && version) {
            this._database.version(version).stores(sqlObj)
            return this._database
        }
        throw new Error('must have one _databaseName')
    }

    /**
     * 查询数据(判断时间的有效期)
     * @param query {Object} 查询条件
     * @param table {String} 表名
     */
    async getItem(query, table) {
        try {
            let item = await this._database[table].get(query)
            if (item && item.expires && item.startTime) {
                const date = new Date().getTime()
                if (date - item.startTime > item.expires) {
                    await this._database[table].delete(item.id)
                    return undefined
                } else {
                    return item
                }
            } else {
                return item
            }
        } catch (e) {
            throw new Error(e.message)
        }

    }

    /**
     * 更新数据(数据存在则更新不存在添加)
     * @param value
     * @param table
     * @param query <Object> 查询条件
     * @param expires Number 过期时间
     */
    async setItem(value, table, query, expires) {
        try {
            const currentData = query ? await this._database[table].get(query) : null
            if (currentData) {
                return await this._database[table].update(currentData.id, {
                    expires: expires || 10000000,
                    ...value,
                })
            }else  {
                return await this._database[table].put( {
                    expires: expires || 10000000,
                    ...value,
                })
            }
        } catch (e) {
            throw new Error(e.message)
        }

    }

    /**
     * 删除数据
     * @param queryIds <Array>
     * @param table
     * @returns {Promise<void>}
     */
    async deleteItem(queryIds, table) {
        try {
            return await this._database[table].bulkDelete(queryIds)
        } catch (e) {
            throw new Error(e.message)
        }
    }

    /**
     * 清空table数据
     * @param table <String | Array<String>>
     * @returns {Promise<void>}
     */
    async clearTable(table) {
        try {
            const tables = Array.isArray(table) ? table ? [table] : [] : table
            if (Array.isArray(tables)) {
                for(let i = 0 ; i < tables.length; i++ ) {
                    await this._database[tables[i]].clear()
                }
            }
        } catch (e) {
            throw new Error(e.message)
        }
    }
}
