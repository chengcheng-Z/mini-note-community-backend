package com.quanxiaoha.xiaohonshu.auth.constant;

public class RedisKeyConstants {

    //手机号验证码前缀名
    private static final String VERIFICATION_CODE_KEY_PREFIX ="verification_code:";

    //前缀拼接
    public static String buildVerificationCodeKey(String phone) {
        return VERIFICATION_CODE_KEY_PREFIX + phone;
    }
}
