/**
 * 存储消息
 * @param message
 */
export const storeNewFriendMessage = message => {
    const messageFromUserId = message.userId;
    try {
        let messageList = JSON.parse(window.localStorage.get('WS-NEW-MESSAGE-LIST'));
        if (messageList && Array.isArray(messageList) && messageList.length > 0) {
            let currentIndex = -1;
            const flag = messageList.some((item, index) => {
                if (item.userId == messageFromUserId) {
                    currentIndex = index;
                }
            });
            if (flag) {
                messageList[currentIndex] = { ...message, type: 'FRIEND-MESSAGE' };
            } else {
                messageList = [{ ...message, type: 'FRIEND-MESSAGE' }];
            }
        } else {
            messageList = [{ ...message, type: 'FRIEND-MESSAGE' }];
        }
        window.localStorage.setItem('WS-NEW-MESSAGE-LIST', JSON.stringify(messageList));
    } catch (e) {
        throw new Error(e);
    }
};

/**
 * 查询好友消息列表
 * @param query
 */
export const findFriendMessage = async ({friendId, userId, pageSize = 10, page = 1}) => {
    return await window._globalIndexedDB._database.friendMessage.where("friendId")
        .anyOf([friendId, userId])
        .or("userId")
        .anyOf([friendId, userId])
        .offset((page - 1) * pageSize)
        .limit(pageSize)
        .toArray()
}

/**
 * 查询好友消息列表
 * @param query
 */
export const findFriendMessageCount = async () => {
    return await window._globalIndexedDB._database.friendMessage
        .count()
}
