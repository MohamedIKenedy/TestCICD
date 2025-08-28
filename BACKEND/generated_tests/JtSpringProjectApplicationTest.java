package com.jtspringproject.JtSpringProject;

import org.junit.jupiter.api.Test;
import org.springframework.boot.SpringApplication;
import org.springframework.context.ConfigurableApplicationContext;

import static org.junit.jupiter.api.Assertions.assertNotNull;

public class JtSpringProjectApplicationTests {

    @Test
    public void testMain() {
        // 模拟运行 SpringApplication.main 方法
        String[] args = {};
        ConfigurableApplicationContext context = null;

        try {
            JtSpringProjectApplication.main(args);
        } catch (Exception e) {
            // 捕获异常并打印堆栈跟踪（可选）
            e.printStackTrace();
        }

        // 确保应用程序上下文不为空
        assertNotNull(context, "ApplicationContext should not be null");
    }
}