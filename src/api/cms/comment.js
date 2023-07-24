import request from '@/utils/request'

export function searchComment(query) {

    return request({
        url: '/cms/comment/searchComment',
        method: 'get',
        params: query
    })
}
export function deleteComment(query) {
     return request({
        url: '/cms/comment/deleteCommentBySys',
        method: 'get',
        params: query
    })
}