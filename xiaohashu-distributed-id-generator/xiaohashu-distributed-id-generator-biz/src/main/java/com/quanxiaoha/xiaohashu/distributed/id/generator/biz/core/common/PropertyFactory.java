package com.quanxiaoha.xiaohashu.distributed.id.generator.biz.core.common;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.Properties;

public class PropertyFactory {
    private static final Logger logger = LoggerFactory.getLogger(PropertyFactory.class);
    private static final Properties prop = new Properties();

    private static final String[] OVERRIDABLE_KEYS = {
            "leaf.name",
            "leaf.segment.enable",
            "leaf.jdbc.url",
            "leaf.jdbc.username",
            "leaf.jdbc.password",
            "leaf.snowflake.enable",
            "leaf.snowflake.zk.address",
            "leaf.snowflake.port"
    };

    static {
        try {
            prop.load(PropertyFactory.class.getClassLoader().getResourceAsStream("leaf.properties"));
        } catch (IOException e) {
            logger.warn("Load Properties Ex", e);
        }

        for (String key : OVERRIDABLE_KEYS) {
            String value = System.getenv(key.toUpperCase().replace('.', '_').replace('-', '_'));
            if (value == null || value.isEmpty()) {
                value = System.getProperty(key);
            }
            if (value != null && !value.isEmpty()) {
                prop.setProperty(key, value);
            }
        }
    }
    public static Properties getProperties() {
        return prop;
    }
}
