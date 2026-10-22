-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: xiaohashu
-- ------------------------------------------------------
-- Server version	8.0.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `xiaohashu`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `xiaohashu` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `xiaohashu`;

--
-- Table structure for table `t_channel`
--

DROP TABLE IF EXISTS `t_channel`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_channel` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `name` varchar(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '频道名称',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
  `is_deleted` bit(1) NOT NULL DEFAULT b'0' COMMENT '逻辑删除(0：未删除 1：已删除)',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='频道表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_channel`
--

LOCK TABLES `t_channel` WRITE;
/*!40000 ALTER TABLE `t_channel` DISABLE KEYS */;
INSERT INTO `t_channel` VALUES (1,'美食','2025-12-06 20:55:30','2025-12-06 20:55:30',_binary '\0'),(2,'娱乐','2025-12-06 20:55:35','2025-12-06 20:55:35',_binary '\0');
/*!40000 ALTER TABLE `t_channel` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_channel_topic_rel`
--

DROP TABLE IF EXISTS `t_channel_topic_rel`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_channel_topic_rel` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `channel_id` bigint unsigned NOT NULL COMMENT '频道ID',
  `topic_id` bigint unsigned NOT NULL COMMENT '话题ID',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='频道-话题关联表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_channel_topic_rel`
--

LOCK TABLES `t_channel_topic_rel` WRITE;
/*!40000 ALTER TABLE `t_channel_topic_rel` DISABLE KEYS */;
INSERT INTO `t_channel_topic_rel` VALUES (1,2,1,'2025-12-06 20:56:16','2025-12-06 20:56:16'),(2,2,2,'2025-12-06 20:56:20','2025-12-06 20:56:20');
/*!40000 ALTER TABLE `t_channel_topic_rel` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_fans`
--

DROP TABLE IF EXISTS `t_fans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_fans` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` bigint unsigned NOT NULL COMMENT '用户ID',
  `fans_user_id` bigint unsigned NOT NULL COMMENT '粉丝的用户ID',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uk_user_id_fans_user_id` (`user_id`,`fans_user_id`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户粉丝表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_fans`
--

LOCK TABLES `t_fans` WRITE;
/*!40000 ALTER TABLE `t_fans` DISABLE KEYS */;
/*!40000 ALTER TABLE `t_fans` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_following`
--

DROP TABLE IF EXISTS `t_following`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_following` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` bigint unsigned NOT NULL COMMENT '用户ID',
  `following_user_id` bigint unsigned NOT NULL COMMENT '关注的用户ID',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uk_user_id_following_user_id` (`user_id`,`following_user_id`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户关注表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_following`
--

LOCK TABLES `t_following` WRITE;
/*!40000 ALTER TABLE `t_following` DISABLE KEYS */;
/*!40000 ALTER TABLE `t_following` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_note`
--

DROP TABLE IF EXISTS `t_note`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_note` (
  `id` bigint unsigned NOT NULL COMMENT '主键ID',
  `title` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '标题',
  `is_content_empty` bit(1) NOT NULL DEFAULT b'0' COMMENT '内容是否为空(0：不为空 1：空)',
  `creator_id` bigint unsigned NOT NULL COMMENT '发布者ID',
  `topic_id` bigint unsigned DEFAULT NULL COMMENT '话题ID',
  `topic_name` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '话题名称',
  `is_top` bit(1) NOT NULL DEFAULT b'0' COMMENT '是否置顶(0：未置顶 1：置顶)',
  `type` tinyint DEFAULT '0' COMMENT '类型(0：图文 1：视频)',
  `img_uris` varchar(660) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '笔记图片链接(逗号隔开)',
  `video_uri` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '视频链接',
  `visible` tinyint DEFAULT '0' COMMENT '可见范围(0：公开,所有人可见 1：仅对自己可见)',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
  `status` tinyint NOT NULL DEFAULT '0' COMMENT '状态(0：待审核 1：正常展示 2：被删除(逻辑删除) 3：被下架)',
  `content_uuid` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '笔记内容UUID',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `idx_creator_id` (`creator_id`),
  KEY `idx_topic_id` (`topic_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='笔记表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_note`
--

LOCK TABLES `t_note` WRITE;
/*!40000 ALTER TABLE `t_note` DISABLE KEYS */;
INSERT INTO `t_note` VALUES (1997291691165351986,'图文笔记测试标题',_binary '\0',2,1,'高分美剧推荐',_binary '\0',0,'http://116.62.199.48:9000/weblog/c89cc6b66f0341c0b7854771ae063eac.jpg',NULL,0,'2025-12-06 21:07:02','2025-12-08 21:11:15',1,''),(1997291813831966752,'图文笔记测试标题',_binary '\0',2,1,'高分美剧推荐',_binary '\0',1,NULL,'http://116.62.199.48:9000/weblog/c89cc6b66f0341c0b7854771ae063eac.jpg',0,'2025-12-06 21:07:31','2025-12-06 21:07:31',1,'');
/*!40000 ALTER TABLE `t_note` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_note_collection`
--

DROP TABLE IF EXISTS `t_note_collection`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_note_collection` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` bigint NOT NULL COMMENT '用户ID',
  `note_id` bigint NOT NULL COMMENT '笔记ID',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `status` tinyint NOT NULL DEFAULT '0' COMMENT '收藏状态(0：取消收藏 1：收藏)',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uk_user_id_note_id` (`user_id`,`note_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='笔记收藏表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_note_collection`
--

LOCK TABLES `t_note_collection` WRITE;
/*!40000 ALTER TABLE `t_note_collection` DISABLE KEYS */;
/*!40000 ALTER TABLE `t_note_collection` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_note_count`
--

DROP TABLE IF EXISTS `t_note_count`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_note_count` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `note_id` bigint unsigned NOT NULL COMMENT '笔记ID',
  `like_total` bigint DEFAULT '0' COMMENT '获得点赞总数',
  `collect_total` bigint DEFAULT '0' COMMENT '获得收藏总数',
  `comment_total` bigint DEFAULT '0' COMMENT '被评论总数',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uk_note_id` (`note_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='笔记计数表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_note_count`
--

LOCK TABLES `t_note_count` WRITE;
/*!40000 ALTER TABLE `t_note_count` DISABLE KEYS */;
/*!40000 ALTER TABLE `t_note_count` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_note_like`
--

DROP TABLE IF EXISTS `t_note_like`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_note_like` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` bigint NOT NULL COMMENT '用户ID',
  `note_id` bigint NOT NULL COMMENT '笔记ID',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `status` tinyint NOT NULL DEFAULT '0' COMMENT '点赞状态(0：取消点赞 1：点赞)',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uk_user_id_note_id` (`user_id`,`note_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='笔记点赞表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_note_like`
--

LOCK TABLES `t_note_like` WRITE;
/*!40000 ALTER TABLE `t_note_like` DISABLE KEYS */;
/*!40000 ALTER TABLE `t_note_like` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_permission`
--

DROP TABLE IF EXISTS `t_permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_permission` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `parent_id` bigint unsigned NOT NULL DEFAULT '0' COMMENT '父ID',
  `name` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '权限名称',
  `type` tinyint unsigned NOT NULL COMMENT '类型(1：目录 2：菜单 3：按钮)',
  `menu_url` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '' COMMENT '菜单路由',
  `menu_icon` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '' COMMENT '菜单图标',
  `sort` int unsigned NOT NULL DEFAULT '0' COMMENT '管理系统中的显示顺序',
  `permission_key` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '权限标识',
  `status` tinyint unsigned NOT NULL DEFAULT '0' COMMENT '状态(0：启用；1：禁用)',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
  `is_deleted` bit(1) NOT NULL DEFAULT b'0' COMMENT '逻辑删除(0：未删除 1：已删除)',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='权限表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_permission`
--

LOCK TABLES `t_permission` WRITE;
/*!40000 ALTER TABLE `t_permission` DISABLE KEYS */;
INSERT INTO `t_permission` VALUES (1,0,'发布笔记',3,'','',1,'app:note:publish',0,'2025-11-12 10:52:44','2025-11-12 10:52:44',_binary '\0'),(2,0,'发布评论',3,'','',2,'app:comment:publish',0,'2025-11-12 10:52:48','2025-11-12 10:52:48',_binary '\0');
/*!40000 ALTER TABLE `t_permission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_role`
--

DROP TABLE IF EXISTS `t_role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_role` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `role_name` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '角色名',
  `role_key` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '角色唯一标识',
  `status` tinyint NOT NULL DEFAULT '0' COMMENT '状态(0：启用 1：禁用)',
  `sort` int unsigned NOT NULL DEFAULT '0' COMMENT '管理系统中的显示顺序',
  `remark` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '备注',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '最后一次更新时间',
  `is_deleted` bit(1) NOT NULL DEFAULT b'0' COMMENT '逻辑删除(0：未删除 1：已删除)',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uk_role_key` (`role_key`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_role`
--

LOCK TABLES `t_role` WRITE;
/*!40000 ALTER TABLE `t_role` DISABLE KEYS */;
INSERT INTO `t_role` VALUES (1,'普通用户','common_user',0,1,'','2025-11-12 10:53:37','2025-11-12 10:53:37',_binary '\0');
/*!40000 ALTER TABLE `t_role` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_role_permission_rel`
--

DROP TABLE IF EXISTS `t_role_permission_rel`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_role_permission_rel` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `role_id` bigint unsigned NOT NULL COMMENT '角色ID',
  `permission_id` bigint unsigned NOT NULL COMMENT '权限ID',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
  `is_deleted` bit(1) NOT NULL DEFAULT b'0' COMMENT '逻辑删除(0：未删除 1：已删除)',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户权限表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_role_permission_rel`
--

LOCK TABLES `t_role_permission_rel` WRITE;
/*!40000 ALTER TABLE `t_role_permission_rel` DISABLE KEYS */;
INSERT INTO `t_role_permission_rel` VALUES (1,1,1,'2025-11-12 10:54:06','2025-11-12 10:54:06',_binary '\0'),(2,1,2,'2025-11-12 10:54:10','2025-11-12 10:54:10',_binary '\0');
/*!40000 ALTER TABLE `t_role_permission_rel` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_topic`
--

DROP TABLE IF EXISTS `t_topic`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_topic` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `name` varchar(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '话题名称',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
  `is_deleted` bit(1) NOT NULL DEFAULT b'0' COMMENT '逻辑删除(0：未删除 1：已删除)',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='话题表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_topic`
--

LOCK TABLES `t_topic` WRITE;
/*!40000 ALTER TABLE `t_topic` DISABLE KEYS */;
INSERT INTO `t_topic` VALUES (1,'高分美剧推荐','2025-12-06 20:55:52','2025-12-06 20:55:52',_binary '\0'),(2,'下饭综艺推荐','2025-12-06 20:55:55','2025-12-06 20:55:55',_binary '\0');
/*!40000 ALTER TABLE `t_topic` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_user`
--

DROP TABLE IF EXISTS `t_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_user` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `xiaohashu_id` varchar(15) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '小哈书号(唯一凭证)',
  `password` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '密码',
  `nickname` varchar(24) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '昵称',
  `avatar` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '头像',
  `birthday` date DEFAULT NULL COMMENT '生日',
  `background_img` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '背景图',
  `phone` varchar(11) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '手机号',
  `sex` tinyint DEFAULT '0' COMMENT '性别(0：女 1：男)',
  `status` tinyint NOT NULL DEFAULT '0' COMMENT '状态(0：启用 1：禁用)',
  `introduction` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '个人简介',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
  `is_deleted` bit(1) NOT NULL DEFAULT b'0' COMMENT '逻辑删除(0：未删除 1：已删除)',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uk_xiaohashu_id` (`xiaohashu_id`),
  UNIQUE KEY `uk_phone` (`phone`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_user`
--

LOCK TABLES `t_user` WRITE;
/*!40000 ALTER TABLE `t_user` DISABLE KEYS */;
INSERT INTO `t_user` VALUES (2,'10003','$2a$10$cjk0DlyZf2CHrqKDGbk89O0CN9PtXVHBz3OVLB8IhRlk8pVkpJYAm','帕帕','http://127.0.0.1:9090/xiaohashu/9efd28cd1eb74132a2bcd6b7706f4b95.jpg','2006-04-17',NULL,'19379683792',NULL,0,NULL,'2025-11-20 16:34:58','2025-11-27 15:57:42',_binary '\0');
/*!40000 ALTER TABLE `t_user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_user_count`
--

DROP TABLE IF EXISTS `t_user_count`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_user_count` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` bigint unsigned NOT NULL COMMENT '用户ID',
  `fans_total` bigint DEFAULT '0' COMMENT '粉丝总数',
  `following_total` bigint DEFAULT '0' COMMENT '关注总数',
  `note_total` bigint DEFAULT '0' COMMENT '发布笔记总数',
  `like_total` bigint DEFAULT '0' COMMENT '获得点赞总数',
  `collect_total` bigint DEFAULT '0' COMMENT '获得收藏总数',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uk_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户计数表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_user_count`
--

LOCK TABLES `t_user_count` WRITE;
/*!40000 ALTER TABLE `t_user_count` DISABLE KEYS */;
/*!40000 ALTER TABLE `t_user_count` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_user_role_rel`
--

DROP TABLE IF EXISTS `t_user_role_rel`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_user_role_rel` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` bigint unsigned NOT NULL COMMENT '用户ID',
  `role_id` bigint unsigned NOT NULL COMMENT '角色ID',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
  `is_deleted` bit(1) NOT NULL DEFAULT b'0' COMMENT '逻辑删除(0：未删除 1：已删除)',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户角色表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_user_role_rel`
--

LOCK TABLES `t_user_role_rel` WRITE;
/*!40000 ALTER TABLE `t_user_role_rel` DISABLE KEYS */;
INSERT INTO `t_user_role_rel` VALUES (2,2,1,'2025-11-20 16:34:58','2025-11-20 16:34:58',_binary '\0');
/*!40000 ALTER TABLE `t_user_role_rel` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'xiaohashu'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-21 21:39:20
