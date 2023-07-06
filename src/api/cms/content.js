import request from '@/utils/request'

export function searchContent(query) {
   
    return request({
        url: '/cms/content/searchContent',
        method: 'get',
        params: query
    })
}