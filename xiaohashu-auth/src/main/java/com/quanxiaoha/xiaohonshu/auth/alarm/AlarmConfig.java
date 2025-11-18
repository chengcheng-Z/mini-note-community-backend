package com.quanxiaoha.xiaohonshu.auth.alarm;

import com.quanxiaoha.xiaohonshu.auth.alarm.impl.MailAlarmHelper;
import com.quanxiaoha.xiaohonshu.auth.alarm.impl.SmsAlarmHelper;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AlarmConfig {

    @Value("${alarm.type}")
    private String type;

    @Bean
    @RefreshScope
    public  AlarmInterface alarmHelper(){
           if(StringUtils.equals("sms",type)){
               return new SmsAlarmHelper();
           }else if(StringUtils.equals("email",type)){
               return new MailAlarmHelper();
           }else{
               throw new  IllegalArgumentException("错误的告警类型...");
           }
    }

}
