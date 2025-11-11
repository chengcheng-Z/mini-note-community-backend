package com.quanxiaoha.xiaohonshu.auth.service.impl;

import cn.hutool.core.util.RandomUtil;
import com.quanxiaoha.framework.common.exception.BizException;
import com.quanxiaoha.framework.common.response.Response;
import com.quanxiaoha.xiaohonshu.auth.constant.RedisKeyConstants;
import com.quanxiaoha.xiaohonshu.auth.enums.ResponseCodeEnum;
import com.quanxiaoha.xiaohonshu.auth.model.vo.verificationcode.SendVerificationCodeReqVO;
import com.quanxiaoha.xiaohonshu.auth.service.VerificationCodeService;
import com.quanxiaoha.xiaohonshu.auth.sms.AliyunSmsHelper;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@Slf4j
public class VerificationCodeServiceImpl implements VerificationCodeService {
      @Resource
      private RedisTemplate<String,Object> redisTemplate;
    @Resource(name = "taskExecutor")
      private ThreadPoolTaskExecutor threadPoolTaskExecutor;
    @Resource
    private AliyunSmsHelper aliyunSmsHelper;
    //发送验证码
    @Override
    public Response<?> send(SendVerificationCodeReqVO sendVerificationCodeReqVO) {
             //1.获得手机号
            String phone = sendVerificationCodeReqVO.getPhone();
             //2。拼接成key
        String key = RedisKeyConstants.buildVerificationCodeKey(phone);

        //3.判断有没有该key
         boolean isExist =redisTemplate.hasKey(key);
            //4.有的话直接提示
            if(isExist){
                throw new BizException(ResponseCodeEnum.VERIFICATION_CODE_SEND_FREQUENTLY);
            }
           //5.没有就构建key，value
           //5.1 生成验证码
        String  verificationCode = RandomUtil.randomNumbers(6);
        // 调用第三方短信发送服务
        threadPoolTaskExecutor.submit(() -> {
            String signName = "阿里云短信测试";
            String templateCode = "SMS_154950909";
            String templateParam = String.format("{\"code\":\"%s\"}", verificationCode);
            aliyunSmsHelper.sendMessage(signName, templateCode, phone, templateParam);
        });


        log.info("==> 手机号: {}, 已发送验证码：【{}】", phone, verificationCode);
           //5.3 存储验证码到redis，时间为3分钟
           redisTemplate.opsForValue().set(key,verificationCode,3, TimeUnit.MINUTES);

           return Response.success();
    }
}
