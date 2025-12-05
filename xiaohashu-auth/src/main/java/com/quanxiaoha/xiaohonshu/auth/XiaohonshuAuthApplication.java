package com.quanxiaoha.xiaohonshu.auth;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients(basePackages = "com.quanxiaoha.xiaohashu")
public class XiaohonshuAuthApplication {

    public static void main(String[] args) {
        SpringApplication.run(XiaohonshuAuthApplication.class, args);
    }

}
