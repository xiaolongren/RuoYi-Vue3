import request from '@/utils/request'

export function searchContent(query) {
 
    console.log(query+" uid:")
    return request({
        url: '/cms/content/searchContent',
        method: 'get',
        params: query
    })
}
export function deleteContent(query) {
 
    return request({
        url: '/cms/content/deleteContent',
        method: 'get',
        params: query
    })
}
