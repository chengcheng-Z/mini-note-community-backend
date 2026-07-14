# xiaohashu

轻量级内容社区平台，面向图文 / 视频笔记发布、内容浏览、点赞、关注等用户互动场景。项目基于 Spring Cloud Alibaba 微服务架构拆分业务边界，围绕用户信息读取、点赞状态判断、互动计数统计等高频链路做缓存、异步化和批量落库优化，降低数据库读写压力，提升接口响应速度和系统承载能力。

## 项目亮点

- 基于 Spring Cloud Alibaba 拆分网关、认证、用户、笔记、对象存储、计数、用户关系、KV 存储、分布式 ID 等服务，降低模块耦合度，便于独立扩展。
- 笔记正文等内容型数据使用 Cassandra 存储，点赞、关注等结构化互动数据使用 MySQL 维护，按数据访问特征拆分存储模型。
- 基于 Redis + Caffeine 构建二级缓存，优先读取本地缓存，未命中后查询 Redis，再回源数据库，并通过空值缓存、随机过期时间降低缓存穿透和热点 Key 集中过期风险。
- 针对点赞数、关注数等高频计数变更，采用 Redis 实时更新 + BufferTrigger 时间窗口聚合 + RocketMQ 异步落库，减少数据库频繁 update 带来的写入压力。
- 使用 ZSET 维护用户已点赞笔记列表，支持点赞状态判断、最近点赞记录查询和异步同步；点赞判断方案从 Bloom Filter 演进为 Roaring Bitmap，避免布隆过滤器误判影响业务判断。
- 基于美团 Leaf 实现统一 ID 生成能力，为笔记、点赞、关注等业务数据提供全局唯一 ID，支持号段模式和 Snowflake 模式，避免多业务各自维护 ID 规则导致冲突。
- 图片 / 视频文件统一上传至 OSS，结合 CDN、冷热分层、区域化调度、视频转码和 HLS 切片优化内容加载速度和播放稳定性。

## 核心功能

- 用户认证：基于 Sa-Token 完成登录态维护、Token 校验和网关鉴权。
- 用户服务：用户信息读取、用户基础资料维护、高频用户信息缓存。
- 笔记服务：图文 / 视频笔记发布、笔记内容读取、笔记缓存维护。
- 对象存储：图片、视频等文件上传，支持 OSS 存储能力封装。
- 用户关系：关注、取关、粉丝 / 关注关系维护。
- 点赞互动：点赞、取消点赞、点赞状态判断、最近点赞记录查询。
- 计数服务：点赞数、关注数、粉丝数等互动计数的聚合与异步落库。
- 分布式 ID：为用户、笔记、互动数据提供统一 ID 生成服务。

## 技术栈

| 分类 | 技术 |
| --- | --- |
| 后端框架 | Spring Boot 3、Spring Cloud Alibaba、Spring Cloud Gateway |
| 认证鉴权 | Sa-Token |
| 数据存储 | MySQL、Cassandra、Redis |
| 缓存 | Redis、Caffeine |
| 消息队列 | RocketMQ |
| ID 生成 | Leaf Segment、Snowflake |
| 高性能结构 | Roaring Bitmap、ZSET |
| 异步聚合 | BufferTrigger |
| ORM / 数据访问 | MyBatis、Spring Data Cassandra |
| 对象存储 | Aliyun OSS / MinIO |
| 工具链 | Maven、Java 17、Lombok、Druid、OpenFeign |

## 系统架构

```text
Client
  |
  v
Spring Cloud Gateway
  |
  |-- xiaohashu-auth                 # 认证服务
  |-- xiaohashu-user                 # 用户服务
  |-- xiaohashu-note                 # 笔记服务
  |-- xiaohashu-oss                  # 对象存储服务
  |-- xiaohashu-kv                   # KV / 内容存储服务
  |-- xiaohashu-user-relation        # 关注关系服务
  |-- xiaohashu-count                # 互动计数服务
  |-- xiaohashu-distributed-id-generator # 分布式 ID 服务

Redis / Caffeine / MySQL / Cassandra / RocketMQ / OSS
```

## 重点设计

### 1. 内容数据与互动数据拆分

笔记正文、扩展内容等内容型数据存储在 Cassandra，适合大字段、按 Key 读取和水平扩展场景；点赞、关注、计数等结构化互动数据存储在 MySQL 和 Redis 中，便于事务维护、关系查询和高频更新。

这种拆分避免所有数据都落在单一关系型数据库中，降低内容读取和互动写入互相影响的风险。

### 2. 高频用户信息读取优化

笔记列表、点赞列表等接口会频繁查询用户头像、昵称等信息。项目引入 Redis + Caffeine 二级缓存：

- 优先读取 Caffeine 本地缓存，减少网络开销。
- 本地缓存未命中后读取 Redis，降低数据库访问量。
- Redis 未命中后回源 MySQL，并回填缓存。
- 对不存在的数据写入空值缓存，减少恶意或无效 ID 导致的缓存穿透。
- 对缓存设置随机过期时间，降低热点 Key 同一时间失效造成的回源峰值。

### 3. 高频计数异步落库

点赞数、粉丝数、关注数属于高频变更数据，如果每次操作都直接更新数据库，会造成大量随机写入。

项目采用如下流程：

```text
用户操作
  -> 更新 Redis 计数，保证前端读到较新的结果
  -> 发送 RocketMQ 消息
  -> BufferTrigger 聚合同一时间窗口内的计数变更
  -> 批量写入 MySQL
```

该方案将同步链路上的数据库写入转为异步批处理，提升用户操作响应速度，并降低数据库写压力。

### 4. 点赞状态判断优化

点赞、取消点赞、列表页点赞状态展示是内容社区的高频场景。项目使用 Redis ZSET 维护用户已点赞笔记列表：

- member 存储笔记 ID。
- score 存储点赞时间。
- 支持 O(logN) 写入、按时间范围查询最近点赞记录。
- 可用于点赞状态判断和后续异步同步。

早期方案使用 Bloom Filter 对未点赞用户做快速过滤，但布隆过滤器存在误判风险，在点赞状态这种强业务判断中可能导致结果不准确，因此后续演进为 Roaring Bitmap，兼顾压缩率、查询效率和判断准确性。

### 5. 分布式 ID 生成

项目基于美团 Leaf 提供统一 ID 生成能力，为用户、笔记、点赞、关注等业务数据生成全局唯一 ID。

- Segment 号段模式：提前从数据库获取一段可用 ID，业务侧本地发号，减少数据库访问频率。
- Snowflake 模式：不依赖第三方存储即可发号，但强依赖机器时钟，需要处理时钟回拨风险。

统一 ID 服务避免各业务模块重复维护 ID 规则，也降低跨模块数据冲突风险。

### 6. 图片 / 视频加载优化

图片和视频统一上传至 OSS，并结合 CDN 做分发加速。对于访问频次不同的内容，设计冷热分层策略；对于不同地区用户，采用区域化调度，优先选择就近边缘节点，降低跨区域访问延迟和源站回源压力。

视频文件通过云服务完成转码和 HLS 切片，配合 CDN 分发提升首屏加载速度、拖拽播放体验和弱网环境下的播放稳定性。

## 模块说明

| 模块 | 说明 |
| --- | --- |
| `xiaohashu-gateway` | API 网关，负责路由转发、统一鉴权入口 |
| `xiaohashu-auth` | 认证服务，负责登录、Token 生成和登录态维护 |
| `xiaohashu-user` | 用户服务，负责用户信息读取和用户缓存 |
| `xiaohashu-note` | 笔记服务，负责笔记发布、读取和缓存维护 |
| `xiaohashu-oss` | 对象存储服务，封装图片 / 视频上传能力 |
| `xiaohashu-kv` | KV 存储服务，负责 Cassandra 内容数据读写 |
| `xiaohashu-user-relation` | 用户关系服务，负责关注、取关、粉丝关系维护 |
| `xiaohashu-count` | 计数服务，负责互动计数聚合和异步落库 |
| `xiaohashu-distributed-id-generator` | 分布式 ID 服务，基于 Leaf 提供统一发号能力 |
| `xiaoha-framework` | 公共组件与基础能力封装 |

## 本地运行

### 环境要求

- JDK 17+
- Maven 3.8+
- MySQL 8+
- Redis 6+
- Cassandra
- RocketMQ
- Nacos，可选，项目中保留了配置中心接入能力
- OSS 或 MinIO，用于本地对象存储调试

### 编译项目

```bash
mvn clean package -DskipTests
```

### 启动顺序

建议先启动基础组件，再启动业务服务：

```text
MySQL / Redis / Cassandra / RocketMQ / OSS
  -> xiaohashu-distributed-id-generator
  -> xiaohashu-auth
  -> xiaohashu-user
  -> xiaohashu-kv
  -> xiaohashu-oss
  -> xiaohashu-note
  -> xiaohashu-user-relation
  -> xiaohashu-count
  -> xiaohashu-gateway
```

### 默认端口

| 服务 | 端口 |
| --- | --- |
| Gateway | `8000` |
| Auth | `8080` |
| OSS | `8081` |
| User | `8082` |
| KV | `8084` |
| Distributed ID | `8085` |
| Note | `8086` |
| User Relation | `8087` |
| Count | `8090` |

## 网关路由

| 路由前缀 | 目标服务 |
| --- | --- |
| `/auth/**` | `xiaohashu-auth` |
| `/user/**` | `xiaohashu-user` |
| `/note/**` | `xiaohashu-note` |
| `/relation/**` | `xiaohashu-user-relation` |

## 项目结构

```text
.
├── xiaohashu-auth                         # 认证服务
├── xiaohashu-count                        # 计数服务
├── xiaohashu-distributed-id-generator     # 分布式 ID 服务
├── xiaohashu-gateway                      # 网关服务
├── xiaohashu-kv                           # KV / Cassandra 内容存储服务
├── xiaohashu-note                         # 笔记服务
├── xiaohashu-oss                          # 对象存储服务
├── xiaohashu-user                         # 用户服务
├── xiaohashu-user-relation                # 用户关系服务
├── xiaoha-framework                       # 公共基础组件
└── pom.xml                                # Maven 父工程
```

## 后续优化方向

- 补全评论系统，支持一级评论、二级回复、评论点赞、评论删除和评论计数。评论系统单独接入消息中台，用于处理评论发布后的计数更新、消息通知、内容审核、失败重试和异常补偿。
- 评论数据按访问场景拆分存储，评论正文和回复内容使用适合扩展的内容存储，评论索引、计数和用户互动状态使用 Redis / MySQL 维护，避免评论列表读取和互动写入互相影响。
- 计数链路增加一致性校验任务，对 Redis 计数、MySQL 计数和明细数据进行抽样比对，处理 MQ 重试、服务重启等场景下可能出现的计数偏差。
- 点赞数据同步机制继续收敛，将点赞明细、Bitmap 构建和缓存刷新拆成更清晰的异步流程，降低热点用户大量点赞数据对 Redis 内存和同步延迟的影响。
- 热点笔记缓存做主动识别，基于访问频次对热点内容提前续期或主动预热，减少热点 Key 过期后瞬时回源带来的数据库压力。
- 视频链路补充上传后处理状态，引入“上传中、转码中、可播放、处理失败”等状态流转，避免用户上传后立即访问到不可播放资源。
