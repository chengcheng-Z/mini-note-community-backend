package com.quanxiaoha.xiaohonshu.auth.service;

import com.quanxiaoha.framework.common.response.Response;
import com.quanxiaoha.xiaohonshu.auth.model.vo.user.UserLoginReqVO;

public interface UserService {
    //登录与注册
    Response<String> loginAndRegister(UserLoginReqVO userLoginReqVO);
}
