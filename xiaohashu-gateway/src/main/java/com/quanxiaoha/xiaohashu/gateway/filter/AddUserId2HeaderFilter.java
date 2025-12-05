package com.quanxiaoha.xiaohashu.gateway.filter;


import cn.dev33.satoken.stp.StpUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.annotation.Order;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

/**
 * @author: 犬小哈
 * @date: 2024/4/9 15:52
 * @version: v1.0.0
 * @description: 转发请求时，将用户 ID 添加到 Header 请求头中，透传给下游服务
 **/
@Component
@Slf4j
@Order(-90)
public class AddUserId2HeaderFilter implements GlobalFilter {

       private static final  String HEADER_USER_ID ="userId";
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        log.info("==================> TokenConvertFilter");
        Long userId =null;
        try{
            userId = StpUtil.getLoginIdAsLong();
        }catch (Exception e){
             return chain.filter(exchange);
        }
        log.info("## 当前登录的用户 ID: {}", userId);

        Long finalUserId = userId;
        ServerWebExchange newExchange = exchange.mutate()
                .request(builder -> builder.header(HEADER_USER_ID, String.valueOf(finalUserId))) // 将用户 ID 设置到请求头中
                .build();
        // 将请求传递给过滤器链中的下一个过滤器进行处理。没有对请求进行任何修改。
        return chain.filter(newExchange);
    }
}

