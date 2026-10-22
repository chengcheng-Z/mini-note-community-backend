CREATE DATABASE IF NOT EXISTS leaf DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE leaf;

CREATE TABLE IF NOT EXISTS leaf_alloc (
    biz_tag VARCHAR(128) NOT NULL DEFAULT '',
    max_id BIGINT NOT NULL DEFAULT 1,
    step INT NOT NULL DEFAULT 1000,
    description VARCHAR(256) DEFAULT NULL,
    update_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (biz_tag)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO leaf_alloc (biz_tag, max_id, step, description) VALUES
    ('leaf-segment-xiaohashu-id', 1, 1000, '小哈书 ID'),
    ('leaf-segment-user-id', 1, 1000, '用户 ID');
