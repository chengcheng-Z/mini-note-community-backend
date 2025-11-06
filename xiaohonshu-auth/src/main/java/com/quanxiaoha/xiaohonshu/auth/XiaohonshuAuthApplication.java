package com.quanxiaoha.xiaohonshu.auth;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.quanxiaoha.xiaohonshu.auth.domain.mapper")
public class XiaohonshuAuthApplication {

    public static void main(String[] args) {
        SpringApplication.run(XiaohonshuAuthApplication.class, args);
    }

}
