package com.quanxiaoha.xiaohonshu.auth.service;

import com.quanxiaoha.framework.common.response.Response;
import com.quanxiaoha.xiaohonshu.auth.model.vo.user.UpdatePasswordReqVO;
import com.quanxiaoha.xiaohonshu.auth.model.vo.user.UserLoginReqVO;

public interface AuthService {
    //登录与注册
    Response<String> loginAndRegister(UserLoginReqVO userLoginReqVO);

    //登出
    Response<?> logout();

    Response<?> updatePassword(UpdatePasswordReqVO updatePasswordReqVO);
}
