import request from '@/utils/request'

export function searchComment(query) {

    return request({
        url: '/cms/comment/searchComment',
        method: 'get',
        params: query
    })
}
export function deleteComment(id,contentType) {
     return request({
        url: '/cms/comment/deleteCommentBySys',
        method: 'get',
        params: { 'id': id + "",'contentType':contentType }
    })
}