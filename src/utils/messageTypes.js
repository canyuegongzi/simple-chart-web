class FriendMessageInfo {
    constructor(options){
        this.type = options.type || 'TEXT';
        this.friendId = options.friendId;
        this.content = options.content;
        this.userId = options.userId;
        this.createTime = options.createTime || new Date().getTime();
    }
}

class GroupMessageInfo {
    constructor(options){
        this.type = options.type || 'TEXT';
        this.groupId = options.groupId;
        this.content = options.content;
        this.userId = options.userId;
        this.targetIds = options.targetIds;
        this.createTime = options.createTime || new Date().getTime();
    }
}
export {
    FriendMessageInfo, GroupMessageInfo
}
