package com.quanxiaoha.xiaohashu.oss.biz.service.impl;

import com.quanxiaoha.framework.common.response.Response;
import com.quanxiaoha.xiaohashu.oss.biz.service.FileService;
import com.quanxiaoha.xiaohashu.oss.biz.strategy.FileStrategy;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@Slf4j
public class FileServiceImpl implements FileService {

    @Resource
    private FileStrategy fileStrategy;
    private static final String MINIOBUCKET_NAME = "xiaohashu";
    private static final String ALIYUNBUCKET_NAME = "xiaohashu-cheng";
    @Override
    public Response<?> uploadFile(MultipartFile file) {
        // 上传文件
        String url = fileStrategy.uploadFile(file, MINIOBUCKET_NAME);
        return Response.success(url);
    }
}