package com.quanxiaoha.xiaohonshu.auth.service.impl;

import cn.dev33.satoken.stp.SaTokenInfo;
import cn.dev33.satoken.stp.StpUtil;
import com.google.common.base.Preconditions;
import com.google.common.collect.Lists;
import com.quanxiaoha.framework.common.enums.DeletedEnum;
import com.quanxiaoha.framework.common.enums.StatusEnum;
import com.quanxiaoha.framework.common.exception.BizException;
import com.quanxiaoha.framework.common.response.Response;
import com.quanxiaoha.framework.common.util.JsonUtils;
import com.quanxiaoha.xiaohonshu.auth.constant.RedisKeyConstants;
import com.quanxiaoha.xiaohonshu.auth.constant.RoleConstants;
import com.quanxiaoha.xiaohonshu.auth.domain.dataobject.UserDO;
import com.quanxiaoha.xiaohonshu.auth.domain.dataobject.UserRoleDO;
import com.quanxiaoha.xiaohonshu.auth.domain.mapper.UserRoleDOMapper;
import com.quanxiaoha.xiaohonshu.auth.enums.LoginTypeEnum;
import com.quanxiaoha.xiaohonshu.auth.enums.ResponseCodeEnum;
import com.quanxiaoha.xiaohonshu.auth.service.UserService;
import com.quanxiaoha.xiaohonshu.auth.model.vo.user.UserLoginReqVO;
import com.quanxiaoha.xiaohonshu.auth.domain.mapper.UserDOMapper;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import org.apache.commons.lang3.StringUtils;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;


@Service
@Slf4j
public class UserServiceImpl implements UserService {
    @Resource
    private UserDOMapper userDOMapper;
    @Resource
    private RedisTemplate<String, Object> redisTemplate;
    @Resource
    private UserRoleDOMapper userRoleDOMapper;
    @Autowired
    private TransactionTemplate transactionTemplate;

    @Override
    public Response<String> loginAndRegister(UserLoginReqVO userLoginReqVO) {
            //1获得手机号
          String phone = userLoginReqVO.getPhone();
           //2获得登录类型
         int type = userLoginReqVO.getType();
        LoginTypeEnum loginTypeEnum =LoginTypeEnum.valueOf(type);
        Long userId =null;
           //3.判断登录类型
            switch (loginTypeEnum) {
                case PASSWORD :
                    //TODO
                    //4.登录类型为密码登录
                    //4.1.通过手机号查询密码
                    // 4.2 密码正确，satoken登录用户
                    //4.3.密码错误，返回错误
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
                // 通过手机号查询记录
                UserDO userDO = userDOMapper.selectByPhone(phone);

                log.info("==> 用户是否注册, phone: {}, userDO: {}", phone, JsonUtils.toJsonString(userDO));

                // 判断是否注册
                if (Objects.isNull(userDO)) {
                      userId =registerUser(phone);

                } else {
                    // 已注册，则获取其用户 ID
                    userId = userDO.getId();
                }
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
      //自动注册
    @Transactional(rollbackFor = Exception.class)
    public Long registerUser(String phone) {
        return transactionTemplate.execute(status -> {
            try {
                //获取全局自增小红书id
                Long xiaohashuId = redisTemplate.opsForValue().increment(RedisKeyConstants.XIAOHASHU_ID_GENERATOR_KEY);
                UserDO userDO = UserDO.builder()
                        .phone(phone)
                        .xiaohashuId(String.valueOf(xiaohashuId))
                        .nickname("小红薯" + xiaohashuId)
                        .status(StatusEnum.ENABLE.getValue())
                        .createTime(LocalDateTime.now())
                        .updateTime(LocalDateTime.now())
                        .isDeleted(DeletedEnum.NO.getValue())
                        .build();
                //添加入库
                userDOMapper.insert(userDO);

                //获取用户ID
                Long userId = userDO.getId();
                //给用户分配默认角色
                UserRoleDO userRoleDO = UserRoleDO.builder()
                        .userId(userId)
                        .roleId(RoleConstants.COMMON_USER_ROLE_ID)
                        .createTime(LocalDateTime.now())
                        .updateTime(LocalDateTime.now())
                        .isDeleted(DeletedEnum.NO.getValue())
                        .build();
                userRoleDOMapper.insert(userRoleDO);

                //将用户ID存入redis
                List<Long> roles = Lists.newArrayList();
                roles.add(RoleConstants.COMMON_USER_ROLE_ID);
                String userRoleKey = RedisKeyConstants.buildUserRoleKey(phone);
                redisTemplate.opsForValue().set(userRoleKey, JsonUtils.toJsonString(roles));
                return userId;
            }catch (Exception e){
                status.setRollbackOnly();
                log.error("==> 系统注册用户异常: ", e);
                return null;
            }
        });


    }



    }

