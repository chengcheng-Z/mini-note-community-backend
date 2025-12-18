package com.quanxiaoha.xiaohashu.user.relation.biz.consumer;

import com.quanxiaoha.framework.common.util.JsonUtils;
import com.quanxiaoha.xiaohashu.user.relation.biz.constant.MQConstants;
import com.quanxiaoha.xiaohashu.user.relation.biz.domain.dataobject.FansDO;
import com.quanxiaoha.xiaohashu.user.relation.biz.domain.dataobject.FollowingDO;
import com.quanxiaoha.xiaohashu.user.relation.biz.domain.mapper.FansDOMapper;
import com.quanxiaoha.xiaohashu.user.relation.biz.domain.mapper.FollowingDOMapper;
import com.quanxiaoha.xiaohashu.user.relation.biz.model.dto.FollowUserMqDTO;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.apache.rocketmq.common.message.Message;
import org.apache.rocketmq.spring.annotation.RocketMQMessageListener;
import org.apache.rocketmq.spring.core.RocketMQListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.LocalDateTime;
import java.util.Objects;

/**
 * @author: 犬小哈
 * @date: 2024/8/9 11:52
 * @version: v1.0.0
 * @description: 关注、取关 MQ 消费者
 **/
@Component
@RocketMQMessageListener(consumerGroup = "xiaohashu_group", // Group 组
        topic = MQConstants.TOPIC_FOLLOW_OR_UNFOLLOW // 消费的主题 Topic
)
@Slf4j
public class FollowUnfollowConsumer implements RocketMQListener<Message> {

    @Resource
    private FollowingDOMapper followingDOMapper;
    @Resource
    private FansDOMapper fansDOMapper;
    @Resource
    private TransactionTemplate transactionTemplate;

    @Override
    public void onMessage(Message message) {
        // 消息体
        String bodyJsonStr = new String(message.getBody());
        // 标签
        String tags = message.getTags();

        log.info("==> FollowUnfollowConsumer 消费了消息 {}, tags: {}", bodyJsonStr, tags);

        // 根据 MQ 标签，判断操作类型
        if (Objects.equals(tags, MQConstants.TAG_FOLLOW)) { // 关注
            handleFollowTagMessage(bodyJsonStr);
        } else if (Objects.equals(tags, MQConstants.TAG_UNFOLLOW)) { // 取关
            // TODO
        }
    }

    /**
     * 关注
     * @param bodyJsonStr
     */
    private void handleFollowTagMessage(String bodyJsonStr) {
        // 将消息体 Json 字符串转为 DTO 对象
        FollowUserMqDTO followUserMqDTO = JsonUtils.parseObject(bodyJsonStr, FollowUserMqDTO.class);

        // 判空
        if (Objects.isNull(followUserMqDTO)) return;

        // 幂等性：通过联合唯一索引保证

        Long userId = followUserMqDTO.getUserId();
        Long followUserId = followUserMqDTO.getFollowUserId();
        LocalDateTime createTime = followUserMqDTO.getCreateTime();

        // 编程式提交事务
        boolean isSuccess = Boolean.TRUE.equals(transactionTemplate.execute(status -> {
            try {
                // 关注成功需往数据库添加两条记录
                // 关注表：一条记录
                int count = followingDOMapper.insert(FollowingDO.builder()
                        .userId(userId)
                        .followingUserId(followUserId)
                        .createTime(createTime)
                        .build());

                // 粉丝表：一条记录
                if (count > 0) {
                    fansDOMapper.insert(FansDO.builder()
                            .userId(followUserId)
                            .fansUserId(userId)
                            .createTime(createTime)
                            .build());
                }
                return true;
            } catch (Exception ex) {
                status.setRollbackOnly(); // 标记事务为回滚
                log.error("", ex);
            }
            return false;
        }));

        log.info("## 数据库添加记录结果：{}", isSuccess);
        // TODO: 更新 Redis 中被关注用户的 ZSet 粉丝列表
    }


}

