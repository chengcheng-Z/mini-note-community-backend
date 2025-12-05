package com.quanxiaoha.xiaohonshu.auth.service.impl;

import cn.dev33.satoken.stp.SaTokenInfo;
import cn.dev33.satoken.stp.StpUtil;
import com.google.common.base.Preconditions;
import com.quanxiaoha.framework.biz.context.holder.LoginUserContextHolder;
import com.quanxiaoha.framework.common.exception.BizException;
import com.quanxiaoha.framework.common.response.Response;
import com.quanxiaoha.xiaohashu.user.dto.resp.FindUserByPhoneRspDTO;
import com.quanxiaoha.xiaohonshu.auth.constant.RedisKeyConstants;
import com.quanxiaoha.xiaohonshu.auth.enums.LoginTypeEnum;
import com.quanxiaoha.xiaohonshu.auth.enums.ResponseCodeEnum;
import com.quanxiaoha.xiaohonshu.auth.model.vo.user.UpdatePasswordReqVO;
import com.quanxiaoha.xiaohonshu.auth.rpc.UserRpcService;
import com.quanxiaoha.xiaohonshu.auth.service.AuthService;
import com.quanxiaoha.xiaohonshu.auth.model.vo.user.UserLoginReqVO;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Objects;
import org.apache.commons.lang3.StringUtils;


@Service
@Slf4j
public class AuthServiceImpl implements AuthService {

    @Resource
    private RedisTemplate<String, Object> redisTemplate;
    @Resource
    private UserRpcService userRpcService;

    @Resource
    private PasswordEncoder passwordEncoder;


    @Override
    public Response<String> loginAndRegister(UserLoginReqVO userLoginReqVO) {
            //1获得手机号
          String phone = userLoginReqVO.getPhone();
           //2获得登录类型
         Integer type = userLoginReqVO.getType();
        LoginTypeEnum loginTypeEnum =LoginTypeEnum.valueOf(type);
        if(Objects.isNull(loginTypeEnum)){
            throw new BizException(ResponseCodeEnum.LOGIN_TYPE_ERROR);
        }
        Long userId =null;
           //3.判断登录类型
            switch (loginTypeEnum) {
                case PASSWORD: // 密码登录
                    String password = userLoginReqVO.getPassword();

                    // RPC: 调用用户服务，通过手机号查询用户
                    FindUserByPhoneRspDTO findUserByPhoneRspDTO = userRpcService.findUserByPhone(phone);

                    // 判断该手机号是否注册
                    if (Objects.isNull(findUserByPhoneRspDTO)) {
                        throw new BizException(ResponseCodeEnum.USER_NOT_FOUND);
                    }

                    // 拿到密文密码
                    String encodePassword = findUserByPhoneRspDTO.getPassword();

                    // 匹配密码是否一致
                    boolean isPasswordCorrect = passwordEncoder.matches(password, encodePassword);

                    // 如果不正确，则抛出业务异常，提示用户名或者密码不正确
                    if (!isPasswordCorrect) {
                        throw new BizException(ResponseCodeEnum.PHONE_OR_PASSWORD_ERROR);
                    }

                    userId = findUserByPhoneRspDTO.getId();
                    break;
                //5.登录类型为验证码登录
                case VERIFICATION_CODE:
                    String verificationCode =userLoginReqVO.getCode();
                    //校验验证码是否为空
                    Preconditions.checkArgument(StringUtils.isNotBlank(verificationCode), "验证码不能为空");
                    //构建验证码redis key
                    String key = RedisKeyConstants.buildVerificationCodeKey(phone);
                    //查询验证码
                    String sentCode =(String) redisTemplate.opsForValue().get(key);
                    //5.1.拿验证码去redis里对比
                    if(!StringUtils.equals(verificationCode, sentCode)){
                        throw new BizException(ResponseCodeEnum.VERIFICATION_CODE_ERROR);
                    }
                    // RPC: 调用用户服务，注册用户
                    Long userIdTmp = userRpcService.registerUser(phone);

                    // 若调用用户服务，返回的用户 ID 为空，则提示登录失败
                    if (Objects.isNull(userIdTmp)) {
                        throw new BizException(ResponseCodeEnum.LOGIN_FAIL);
                    }
                    userId = userIdTmp;
                break;
                default: break;
            }


        // SaToken 登录用户, 入参为用户 ID
        StpUtil.login(userId);

        // 获取 Token 令牌
        SaTokenInfo tokenInfo = StpUtil.getTokenInfo();

        // 返回 Token 令牌
        return Response.success(tokenInfo.tokenValue);

    }

    @Override
    public Response<?> logout() {
        // 退出登录 (指定用户 ID)
        Long userId = LoginUserContextHolder.getUserId();
        log.info("==>用户退出登录，userId:{}",userId);
        StpUtil.logout(userId);

        return Response.success();
    }

    @Override
    public Response<?> updatePassword(UpdatePasswordReqVO updatePasswordReqVO) {
        String newPassword = updatePasswordReqVO.getNewPassword();
        String encodePassword = passwordEncoder.encode(newPassword);
        // RPC: 调用用户服务：更新密码
        userRpcService.updatePassword(encodePassword);

        return Response.success();
    }




    }





