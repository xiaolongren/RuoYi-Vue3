import request from '@/utils/request'

export function getWaittingVerify(query) {
     return request({
        url: '/info/update/getRequestUpdateInfo',
        method: 'get',
        params: query
    })
}
export function  getCredential(query){
    return request({
        url: '/info/update/getCredential',
        method: 'get',
        params: query
    })
}
export function deleteCredential(query){
    return request({
        url:'/info/update/deleteCredential',
        method: 'get',
        params:query
    })
}
export function updateUserInfoFail(query){
    return request({
        url:'/info/update/rejectRequestUpdateInfo',
        method: 'get',
        params:query
    })
}
export function updateUserInfoSuccess(query){
    return request({
        url:'/info/update/passRequestUpdateInfo',
        method: 'get',
        params:query
    })
}