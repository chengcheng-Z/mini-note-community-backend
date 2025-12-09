package com.quanxiaoha.xiaohashu.note.biz.constant;

/**
 * @author: 犬小哈
 * @date: 2024/5/21 15:04
 * @version: v1.0.0
 * @description: TODO
 **/
public class RedisKeyConstants {

    /**
     * 笔记详情 KEY 前缀
     */
    public static final String NOTE_DETAIL_KEY = "note:detail:";


    /**
     * 构建完整的笔记详情 KEY
     * @param noteId
     * @return
     */
    public static String buildNoteDetailKey(Long noteId) {
        return NOTE_DETAIL_KEY + noteId;
    }

}

