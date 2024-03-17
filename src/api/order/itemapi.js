import request from '@/utils/request'

// 编辑金豆
export function getJindoItems(uid,token) {
  return request({
    url: '/cms/order/getJindouItem',
    method: 'get',
    params: {'uid':uid,'token':token,'page':1,'pageSize':100}
  })
}

export function updateItemSpecs(uid,token,itemspecsjson){
  return request({
    url: '/cms/order/updateItemSpecs' ,
    method: 'post',
    params:{'uid':uid+"",'token':token,'itemspecsjson':itemspecsjson}
  })
}